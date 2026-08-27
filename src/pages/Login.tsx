export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-farm-green-50 p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-farm-green-800 mb-6">Farm Journal & Financial Manager</h1>
        <p className="text-center text-gray-500 mb-6">Sign in to your account</p>
        <button className="w-full bg-farm-green-600 text-white p-3 rounded-lg font-medium hover:bg-farm-green-700 transition">
          Sign In
        </button>
      </div>
    </div>
  );
}
