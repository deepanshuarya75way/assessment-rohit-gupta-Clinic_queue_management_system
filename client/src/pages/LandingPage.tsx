import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 via-primary-600 to-primary-800 flex items-center justify-center">
      <div className="text-center text-white max-w-lg mx-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Clinic Queue System</h1>
          <p className="text-primary-100 text-lg">Digital queue management for modern clinics</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link to="/login"
            className="bg-white text-primary-700 rounded-xl p-6 hover:shadow-lg transition-shadow">
            <div className="font-semibold text-lg mb-1">Staff Login</div>
            <p className="text-sm text-gray-500">Doctors, receptionists & admins</p>
          </Link>

          <Link to="/patient/login"
            className="bg-white/20 backdrop-blur rounded-xl p-6 hover:bg-white/30 transition-colors border border-white/30">
            <div className="font-semibold text-lg mb-1">Patient Portal</div>
            <p className="text-sm text-white/80">Book appointments & track queue</p>
          </Link>
        </div>

        <div className="mt-8">
          <Link to="/display"
            className="inline-block text-sm text-white/70 hover:text-white underline underline-offset-2">
            View waiting room display
          </Link>
        </div>
      </div>
    </div>
  );
}
