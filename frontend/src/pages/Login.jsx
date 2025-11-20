import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({
    rut: '',
    password: ''
  });
  const [error, setError] = useState('');
  
  const { login } = useAuth(); 
  const navigate = useNavigate();

  const handleRutChange = (e) => {
    const value = e.target.value;
    // Validación visual: Solo números, guion, punto y K
    if (value && !/^[0-9kK\.\-]+$/.test(value)) {
      return;
    }
    setFormData({ ...formData, rut: value });
  };

  const handleChange = (e) => {
    setFormData({ 
      ...formData, 
      [e.target.name]: e.target.value 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
        // 1. Limpiamos el RUT (quitamos puntos) para enviarlo limpio
        const rutLimpio = formData.rut.replace(/\./g, ''); 

        // 2. Llamamos al login (esperamos la respuesta del backend)
        const userData = await login(rutLimpio, formData.password);
        
        // 3. Redirección basada en el ROL que viene de la Base de Datos
        if (userData && userData.user) {
            const role = userData.user.role; // "ALUMNO", "PROFESOR", etc.
            
            switch(role) {
                case 'ALUMNO':
                    navigate('/alumno/dashboard'); // Ajusta estas rutas a las tuyas
                    break;
                case 'PROFESOR':
                    navigate('/profesor/dashboard');
                    break;
                case 'JEFE_CARRERA':
                    navigate('/jefe/dashboard');
                    break;
                default:
                    navigate('/dashboard');
            }
        }
    } catch (err) {
        // Si el backend falla (401), mostramos el mensaje aquí
        setError(err.message || 'RUT o contraseña incorrectos');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Portal Electivos ISW
          </h1>
          <p className="text-gray-600">
            Ingresa con tu RUT y contraseña institucional
          </p>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Campo RUT */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                RUT
              </label>
              <input
                type="text"
                name="rut"
                value={formData.rut}
                onChange={handleRutChange}
                placeholder="12.345.678-9"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 placeholder-gray-400 outline-none"
                required
              />
            </div>

            {/* Campo Contraseña */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Ingresa los últimos 5 dígitos"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 placeholder-gray-400 outline-none"
                required
              />
            </div>

            {/* Botón */}
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold shadow-md hover:shadow-lg transition duration-200 flex justify-center"
            >
              Ingresar
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ¿Olvidaste tu clave?{' '}
              <span className="text-blue-600 font-medium cursor-pointer hover:underline">
                Contacta a Jefatura de Carrera
              </span>
            </p>
          </div>
        </div>
        
        {/* Info Footer */}
        <div className="text-center mt-6">  
          <p className="text-xs text-gray-500">
            Universidad del Bío-Bío • Ingeniería de Software
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;