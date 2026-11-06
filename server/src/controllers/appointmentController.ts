import { Response } from 'express';
import { AppDataSource } from '../config/database';
import { Appointment } from '../entities/Appointment';
import { Queue } from '../entities/Queue';
import { AuthRequest } from '../types';
import * as queueEngine from '../services/queueEngine';
import { emitQueueUpdate } from '../socket';
import { sendAppointmentReminder }  from '../services/notificationService';
import { resolve } from 'path';


const repo = () => AppDataSource.getRepository(Appointment);

export async function list(req: AuthRequest, res: Response): Promise<void> {
  const { date, doctorId, status } = req.query;
  const where: any = {};

  if (date) where.appointmentDate = date;
  if (doctorId) where.doctorId = parseInt(doctorId as string);
  if (status) where.status = status;

  const appointments = await repo().find({
    where,
    order: { appointmentTime: 'ASC' },
    relations: ['patient', 'doctor'],
  });
  res.json(appointments);
}

export async function create(req: AuthRequest, res: Response): Promise<void> {
  const { patientId, doctorId, appointmentDate, appointmentTime, notes } = req.body;
  if (!patientId || !doctorId || !appointmentDate || !appointmentTime) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  const appointment = repo().create({
    patientId, doctorId, appointmentDate, appointmentTime, notes,
    status: 'booked',
  });
  await repo().save(appointment);

  const full = await repo().findOne({ where: { id: appointment.id }, relations: ['patient', 'doctor'] });
  res.status(201).json(full);
}

export async function updateStatus(req: AuthRequest, res: Response): Promise<void> {
  const id = parseInt(req.params.id);
  const { status } = req.body;

  const appointment = await repo().findOne({ where: { id }, relations: ['patient', 'doctor'] });
  if (!appointment) {
    res.status(404).json({ error: 'Appointment not found' });
    return;
  }

  const oldStatus = appointment.status;
  appointment.status = status;
  await repo().save(appointment);

  if (oldStatus === 'booked' && status === 'checked-in') {
    try {
      const queueEntry = await queueEngine.addToQueue(
        appointment.patientId,
        appointment.doctorId,
        false
      );
      emitQueueUpdate(appointment.doctorId);
      res.json({ appointment, queueEntry });
      return;
    } catch (err) {
      console.error('[Appointment] Auto-queue creation failed:', err);
    }
  }

  res.json(appointment);
}


// checking appointment before sending
export async function sendReminder(
  req: AuthRequest,
  res: Response
):Promise<void>{
  const id = Number(req.params.id);

  if(!Number.isInteger(id) || id <= 0){
    res.status(400).json({error:'Invalid appointment ID'});
    return;
  }

  try {
    const result = await
    AppDataSource.transaction(async (manager) =>{
      const appointment = await manager.findOne(Appointment,{
        where: {id},
        relations: ['patient', 'doctor'],
        lock: {mode: 'pessimistic_write'},
      });

      if(!appointment){
        return {status: 404, body: {error: 'Appointment not found'}};
      }
      //active booked appointments are allowed
      if(appointment.status !== 'booked'){
        return{
          status: 400,
          body: {error: 'Only booked appointments can receive remainders'},
        };
      }
      // preventing douplicate remainders
      if(appointment.reminderSentAt){
        return{
          status:409,
          body: {error : 'Remainder has already been sent'},

        };
      }
      const appointmentDateTime = new Date(
        `${appointment.appointmentDate}T$
        {appointment.appointmentTime}`
      );

      if(
        Number.isNaN(appointmentDateTime.getTime()) || appointmentDateTime <= new Date()
      ){
        return {
          status: 400,
          body: {error: 'Appontment must be in future'},
        };
      }
      if(!appointment.patient?. phoneNumber || !appointment.doctor?.fullName){
        return {
          status: 400,
          body: {error: 'patient phone or doctor details are missing'},
        };
      }
      const sent = await sendAppointmentReminder(
        appointment.patient.phoneNumber,
        appointment.doctor.fullName,
        appointment.appointmentDate,
        appointment.appointmentTime
      );

      if(!sent){
        return {
          status: 200,
          body: {
            success : false,
            message: 'remainder was not sent'
          },
        };
      }
      appointment.reminderSentAt = new Date();
      await manager.save(Appointment,appointment);
      return {
          status: 200,
          body: {
            success : true,
            message: 'appointment remainder sent',
            appointmentId: appointment.id,
            reminderSentAt: 
            appointment.reminderSentAt,
          },
        };

    });
    res.status(result.status).json(result.body);
  } catch(error){
    console.error('[Appointment] Remainder failed', error);
    res.status(500).json({error: 'Failed to send remainder'});
  }
}