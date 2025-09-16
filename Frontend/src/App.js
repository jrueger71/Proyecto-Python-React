import React, { useEffect, useState } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, deleteDoc, addDoc, updateDoc, doc, setLogLevel } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

// Asume que Tailwind CSS está disponible globalmente, como se requiere en el entorno.

// =================================================================================
// 🔥 CONFIGURACIÓN DE FIREBASE (TU CÓDIGO)
// Se usa la configuración que proporcionaste directamente.
// =================================================================================
const firebaseConfig = {
   
};

// No modifiques estas variables. Se proporcionan desde el entorno.
const currentAppId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// Inicializa Firebase con la configuración proporcionada.
let app;
let auth;
let db;
let storage;

if (firebaseConfig) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  setLogLevel('debug');
}

// =================================================================================
// COMPONENTES Y LÓGICA DE LA APLICACIÓN
// =================================================================================

// Navbar component for navigation.
const Navbar = ({ setCurrentPage, handleLogout }) => {
  return (
    <nav className="bg-gray-900 p-4 shadow-xl rounded-b-3xl">
      <div className="container mx-auto flex flex-wrap justify-between items-center">
        {/* Logo and company name */}
        <div className="flex items-center space-x-2">
          <img
            src="https://placehold.co/50x50/cccccc/333333?text=Logo" // Placeholder for the logo
            alt="Nueva Futbol Chile SpA Logo"
            className="h-10 w-10 rounded-full object-cover border border-gray-600"
          />
          <span className="text-white text-xl font-extrabold uppercase hidden sm:block">Nueva Futbol Chile SpA</span>
        </div>
        {/* Navigation links */}
        <div className="flex flex-grow justify-center sm:justify-end mt-4 sm:mt-0 space-x-2 sm:space-x-4">
          <button onClick={() => setCurrentPage('Home')} className="text-gray-300 hover:text-white transition-colors duration-200 p-2 rounded-lg flex items-center space-x-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="hidden md:inline">Inicio</span>
          </button>
          <button onClick={() => setCurrentPage('PlayerManagement')} className="text-gray-300 hover:text-white transition-colors duration-200 p-2 rounded-lg flex items-center space-x-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h2a2 2 0 002-2V7a2 2 0 00-2-2h-2V3a1 1 0 00-2 0v2H7V3a1 1 0 00-2 0v2H3a2 2 0 00-2 2v11a2 2 0 002 2h2m0-6h14m-8 6h4" />
            </svg>
            <span className="hidden md:inline">Jugadores</span>
          </button>
          <button onClick={() => setCurrentPage('FinanceManagement')} className="text-gray-300 hover:text-white transition-colors duration-200 p-2 rounded-lg flex items-center space-x-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c1.657 0 3 1.343 3 3s-1.343 3-3 3S9 12.657 9 11s1.343-3 3-3z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18c-4.418 0-8-3.582-8-8s3.582-8 8-8 8 3.582 8 8-3.582 8-8 8z" />
            </svg>
            <span className="hidden md:inline">Finanzas</span>
          </button>
          <button onClick={() => setCurrentPage('Other')} className="text-gray-300 hover:text-white transition-colors duration-200 p-2 rounded-lg flex items-center space-x-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A2 2 0 013 15.618V6.382a2 2 0 011.553-1.854L9 2m0 18v-8.5a2 2 0 01.553-1.854L15 9m-6 10.5V15a2 2 0 00-2-2H4" />
            </svg>
            <span className="hidden md:inline">Otros</span>
          </button>
        </div>
        {/* Logout button */}
        <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full transition-all duration-200 shadow-lg flex items-center space-x-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1m-4-1v1m-2-1v1m10 0v-1m-2 1v-1m-2-1v1m-4-1v1m-2-1v1M7 8h10a2 2 0 012 2v10a2 2 0 01-2 2H7a2 2 0 01-2-2V10a2 2 0 012-2z" />
          </svg>
          <span className="hidden sm:inline">Salir</span>
        </button>
      </div>
    </nav>
  );
};

// Home view component.
const HomeView = () => (
  <div className="flex flex-col items-center justify-center text-center p-8 bg-gray-800 text-gray-200 rounded-3xl shadow-xl m-4 border border-gray-700">
    <h1 className="text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">Bienvenido al Panel de Administración</h1>
    <p className="text-lg text-gray-400">Selecciona una opción del menú para comenzar.</p>
  </div>
);

// Login screen component.
const LoginScreen = ({ auth, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleAuth = async () => {
    if (!auth) {
        setErrorMessage("Firebase no está inicializado.");
        return;
    }
    try {
      setErrorMessage('');
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onLoginSuccess(); // Call the login success function
    } catch (error) {
      console.error("Authentication error:", error);
      // Firebase error codes for more user-friendly messages
      let userMessage = "Error de autenticación. Por favor, verifica tus credenciales.";
      if (error.code === 'auth/invalid-email') {
        userMessage = "El formato del correo electrónico es inválido.";
      } else if (error.code === 'auth/user-disabled') {
        userMessage = "El usuario ha sido deshabilitado.";
      } else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        userMessage = "Correo electrónico o contraseña incorrectos.";
      } else if (error.code === 'auth/email-already-in-use') {
        userMessage = "Este correo electrónico ya está registrado.";
      } else if (error.code === 'auth/weak-password') {
        userMessage = "La contraseña debe tener al menos 6 caracteres.";
      }
      setErrorMessage(userMessage);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-700 p-4">
      <div className="bg-gray-800 p-8 rounded-3xl shadow-2xl w-full max-w-md border border-gray-700">
        <h2 className="text-2xl font-bold text-white text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
          {isRegistering ? 'Crear Cuenta' : 'Iniciar Sesión'}
        </h2>
        {errorMessage && (
          <div className="bg-red-800 border border-red-600 text-red-200 px-4 py-3 rounded-lg relative mb-4 text-center">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline ml-2">{errorMessage}</span>
          </div>
        )}
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 mb-4 bg-gray-700 text-white rounded-xl border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 mb-6 bg-gray-700 text-white rounded-xl border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
        />
        <button
          onClick={handleAuth}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all duration-300 shadow-lg transform hover:scale-105"
        >
          {isRegistering ? 'Registrarse' : 'Ingresar'}
        </button>
        <div className="mt-4 text-center">
          <button
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
          >
            {isRegistering ? '¿Ya tienes una cuenta? Iniciar Sesión' : '¿No tienes una cuenta? Registrarse'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Player management component.
const PlayerManager = ({ db, userId, currentAppId }) => {
  const [players, setPlayers] = useState([]);
  const [finances, setFinances] = useState([]); // For calculating personal balance
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddPlayerModal, setShowAddPlayerModal] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null); // For editing an existing player
  const [modalPlayer, setModalPlayer] = useState({ // State for the modal (add/edit)
    rut: '',
    name: '',
    birthDate: '',
    skillFoot: '',
    shoeSize: '',
    gloveSize: '',
    height: '',
    weight: '',
    agency: {
      incorporationDate: '',
      contractActive: false,
      contractDate: '',
      contractDuration: '',
      contractPdfUrl: '',
      contractPdfFile: null,
    },
    club: {
      name: '',
      position: '',
      contractActive: false,
      contractDate: '',
      contractDuration: '',
      salary: '',
      commissionPercentage: '',
      commissionFixed: '',
      transfermarktProfile: '',
      transfermarktValuation: '',
    },
    other: {
      address: '',
      phone: '',
      email: '',
      instagram: '',
      photos: [null, null, null],
      photoUrls: [],
      videoLinks: [''],
    }
  });

  const storage = getStorage();

  // Helper to build the player collection path safely.
  const getPlayersCollectionPath = (appId) => {
    return appId ? `artifacts/${appId}/public/data/players` : `public/data/players`;
  };

  // Helper to build the finance collection path safely.
  const getFinancesCollectionPath = (appId) => {
    return appId ? `artifacts/${appId}/public/data/finances` : `public/data/finances`;
  };

  // Function to calculate the contract expiration date.
  const getContractExpirationDate = (contractDate, contractDuration) => {
    if (!contractDate || !contractDuration) return 'N/A';
    const date = new Date(contractDate);
    date.setMonth(date.getMonth() + parseInt(contractDuration, 10));
    // Format the date as DD/MM/YYYY
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Function to check if a contract is expiring within 6 months.
  const isExpiringSoon = (contractDate, contractDuration) => {
    if (!contractDate || !contractDuration) return false;
    const expirationDate = new Date(contractDate);
    expirationDate.setMonth(expirationDate.getMonth() + parseInt(contractDuration, 10));
    const today = new Date();
    const sixMonthsFromNow = new Date();
    sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
    // Check if the expiration date is in the future and within the next 6 months
    return expirationDate > today && expirationDate <= sixMonthsFromNow;
  };

  // Effect to fetch players and finances.
  useEffect(() => {
    if (!db) return;
    setLoading(true);
    setError(null);
    // Subscribe to changes in the players collection.
    const playersCollectionRef = collection(db, getPlayersCollectionPath(currentAppId));
    const unsubscribePlayers = onSnapshot(playersCollectionRef, (snapshot) => {
      const playersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPlayers(playersData);
    }, (err) => {
      console.error("Error al cargar jugadores:", err);
      setError("No se pudieron cargar los jugadores.");
    });
    // Subscribe to changes in the finances collection.
    const financesCollectionRef = collection(db, getFinancesCollectionPath(currentAppId));
    const unsubscribeFinances = onSnapshot(financesCollectionRef, (snapshot) => {
      const financesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setFinances(financesData);
      setLoading(false);
    }, (err) => {
      console.error("Error al cargar finanzas de jugadores:", err);
      setError("No se pudieron cargar las finanzas de los jugadores.");
      setLoading(false);
    });
    return () => {
      unsubscribePlayers();
      unsubscribeFinances();
    };
  }, [db, currentAppId]);

  // Function to calculate a player's personal balance.
  const getPlayerBalance = (playerId) => {
    if (!playerId || !finances) return 0;
    const playerTransactions = finances.filter(t => t.playerId === playerId);
    const income = playerTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expenses = playerTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    return income - expenses;
  };

  // Initialize modal state when opened for adding or editing.
  useEffect(() => {
    if (showAddPlayerModal) {
      if (editingPlayer) {
        setModalPlayer(editingPlayer);
      } else {
        setModalPlayer({
          rut: '', name: '', birthDate: '', skillFoot: '', shoeSize: '', gloveSize: '', height: '', weight: '',
          agency: {
            incorporationDate: '', contractActive: false, contractDate: '', contractDuration: '', contractPdfUrl: '', contractPdfFile: null,
          },
          club: {
            name: '', position: '', contractActive: false, contractDate: '', contractDuration: '', salary: '', commissionPercentage: '', commissionFixed: '', transfermarktProfile: '', transfermarktValuation: '',
          },
          other: {
            address: '', phone: '', email: '', instagram: '', photos: [null, null, null], photoUrls: [], videoLinks: [''],
          }
        });
      }
    }
  }, [showAddPlayerModal, editingPlayer]);

  const handleDeletePlayer = async (playerId, contractPdfUrl, photoUrls = []) => {
    const confirmed = await new Promise(resolve => {
        const confirmBox = document.createElement('div');
        confirmBox.className = 'fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4';
        confirmBox.innerHTML = `
            <div class="bg-gray-800 p-6 rounded-3xl shadow-2xl w-full max-w-sm border border-gray-700 text-white text-center">
                <p class="mb-4">¿Estás seguro de que quieres eliminar este jugador? Esta acción es irreversible.</p>
                <div class="flex justify-around">
                    <button id="confirm-yes" class="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full transition-colors duration-200">Sí, eliminar</button>
                    <button id="confirm-no" class="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-full transition-colors duration-200">Cancelar</button>
                </div>
            </div>
        `;
        document.body.appendChild(confirmBox);
        document.getElementById('confirm-yes').onclick = () => {
            document.body.removeChild(confirmBox);
            resolve(true);
        };
        document.getElementById('confirm-no').onclick = () => {
            document.body.removeChild(confirmBox);
            resolve(false);
        };
    });
    if (!confirmed) {
      return;
    }
    try {
      const playerDocRef = doc(db, getPlayersCollectionPath(currentAppId), playerId);
      await deleteDoc(playerDocRef);
      if (contractPdfUrl) {
        const fileRef = ref(storage, contractPdfUrl);
        await deleteObject(fileRef).catch(e => console.warn("Error al eliminar PDF de Storage:", e));
      }
      for (const url of photoUrls) {
        const fileRef = ref(storage, url);
        await deleteObject(fileRef).catch(e => console.warn("Error al eliminar foto de Storage:", e));
      }
      setError(null);
    } catch (e) {
      console.error("Error al eliminar jugador:", e);
      setError("No se pudo eliminar el jugador: " + e.message);
    }
  };

  const handlePdfFileChange = (e) => {
    if (e.target.files[0]) {
      setModalPlayer(prev => ({
        ...prev,
        agency: { ...prev.agency, contractPdfFile: e.target.files[0] }
      }));
    } else {
      setModalPlayer(prev => ({
        ...prev,
        agency: { ...prev.agency, contractPdfFile: null }
      }));
    }
  };

  const handlePhotoFileChange = (e, index) => {
    const files = Array.from(e.target.files);
    setModalPlayer(prev => {
      const updatedPhotos = [...prev.other.photos];
      if (files[0]) {
        updatedPhotos[index] = files[0];
      } else {
        updatedPhotos[index] = null;
      }
      return {
        ...prev,
        other: { ...prev.other, photos: updatedPhotos }
      };
    });
  };

  const handleVideoLinkChange = (e, index) => {
    setModalPlayer(prev => {
      const updatedVideoLinks = [...prev.other.videoLinks];
      updatedVideoLinks[index] = e.target.value;
      return {
        ...prev,
        other: { ...prev.other, videoLinks: updatedVideoLinks }
      };
    });
  };

  const addVideoLinkField = () => {
    setModalPlayer(prev => ({
      ...prev,
      other: { ...prev.other, videoLinks: [...prev.other.videoLinks, ''] }
    }));
  };

  const removeVideoLinkField = (index) => {
    setModalPlayer(prev => ({
      ...prev,
      other: { ...prev.other, videoLinks: prev.other.videoLinks.filter((_, i) => i !== index) }
    }));
  };

  const handleSavePlayer = async () => {
    if (!modalPlayer.rut || !modalPlayer.name || !modalPlayer.birthDate || !modalPlayer.height || !modalPlayer.weight || !modalPlayer.club.name || !modalPlayer.club.position) {
      setError("Por favor, completa los campos obligatorios: RUT, Nombre, Fecha de Nacimiento, Altura, Peso, Club y Posición en el Club.");
      return;
    }
    if (!userId) {
      setError("Error: El ID de usuario no está disponible. Asegúrate de estar autenticado para subir archivos.");
      return;
    }
    try {
      setError(null);
      let pdfUrl = modalPlayer.agency.contractPdfUrl;
      // Upload new PDF if one was selected
      if (modalPlayer.agency.contractActive && modalPlayer.agency.contractPdfFile) {
        const file = modalPlayer.agency.contractPdfFile;
        // Use the correct path for contract PDFs based on Firebase Storage rules
        const storageRef = ref(storage, `player_contracts/${userId}/${file.name}_${new Date().getTime()}`);
        const snapshot = await uploadBytes(storageRef, file);
        pdfUrl = await getDownloadURL(snapshot.ref);
      }
      const photoUrls = [...(editingPlayer?.other?.photoUrls || [])]; // Start with existing photo URLs
      // Upload new photos
      for (let i = 0; i < modalPlayer.other.photos.length; i++) {
        const photoFile = modalPlayer.other.photos[i];
        if (photoFile) {
          // Use the correct path for photos based on Firebase Storage rules
          const photoStorageRef = ref(storage, `player_photos/${userId}/${photoFile.name}_${new Date().getTime()}`);
          const photoSnapshot = await uploadBytes(photoStorageRef, photoFile);
          const url = await getDownloadURL(photoSnapshot.ref);
          photoUrls.push(url); // Add new URLs
        }
      }
      const playerToSave = {
        ...modalPlayer,
        agency: {
          ...modalPlayer.agency,
          contractPdfUrl: pdfUrl,
          contractPdfFile: null
        },
        other: {
          ...modalPlayer.other,
          photos: [],
          photoUrls: photoUrls.filter(url => url), // Clean nulls and save URLs
          videoLinks: modalPlayer.other.videoLinks.filter(link => link.trim() !== ''),
        }
      };
      if (editingPlayer) {
        const playerDocRef = doc(db, getPlayersCollectionPath(currentAppId), editingPlayer.id);
        await updateDoc(playerDocRef, playerToSave);
      } else {
        await addDoc(collection(db, getPlayersCollectionPath(currentAppId)), playerToSave);
      }
      setShowAddPlayerModal(false);
      setEditingPlayer(null);
      setError(null);
    } catch (e) {
      console.error("Error al guardar jugador:", e);
      setError(`No se pudo guardar el jugador: ${e.message}. Verifica el RUT y los campos, o problemas con la subida de archivos.`);
    }
  };

  if (loading) return <div className="text-white text-center mt-8">Cargando jugadores y finanzas...</div>;
  if (error) return <div className="bg-red-800 text-red-200 p-4 rounded-lg text-center mx-4 mt-4">{error}</div>;

  return (
    <div className="p-4 md:p-8 bg-gray-900 text-white min-h-screen">
      <div className="flex flex-wrap justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-4 md:mb-0">Gestión de Jugadores</h2>
        <button
          onClick={() => { setShowAddPlayerModal(true); setEditingPlayer(null); }} // Opens the modal in add mode
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full transition-all duration-200 flex items-center space-x-2 shadow-lg transform hover:scale-105"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>Agregar Jugador</span>
        </button>
      </div>

      {showAddPlayerModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gray-800 p-6 rounded-3xl shadow-2xl w-full max-w-3xl border border-gray-700 relative my-8 max-h-[90vh] overflow-y-auto">
            <button onClick={() => { setShowAddPlayerModal(false); setEditingPlayer(null); setError(null); }} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h3 className="text-2xl font-bold mb-6 text-white text-center">{editingPlayer ? 'Editar Jugador' : 'Nuevo Jugador'}</h3>
            {error && <p className="bg-red-800 border border-red-600 text-red-200 px-4 py-3 rounded relative mb-4 text-center">{error}</p>}

            {/* Datos Personales */}
            <div className="mb-8 p-4 border border-gray-700 rounded-2xl">
              <h4 className="text-xl font-semibold text-yellow-400 mb-4">Datos Personales</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" placeholder="RUT (Identificación Principal)" value={modalPlayer.rut} onChange={(e) => setModalPlayer({ ...modalPlayer, rut: e.target.value })} className="w-full p-3 bg-gray-700 text-white rounded-xl border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input type="text" placeholder="Nombre Completo" value={modalPlayer.name} onChange={(e) => setModalPlayer({ ...modalPlayer, name: e.target.value })} className="w-full p-3 bg-gray-700 text-white rounded-xl border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input type="date" placeholder="Fecha de Nacimiento" value={modalPlayer.birthDate} onChange={(e) => setModalPlayer({ ...modalPlayer, birthDate: e.target.value })} className="w-full p-3 bg-gray-700 text-white rounded-xl border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input type="text" placeholder="Pie Hábil" value={modalPlayer.skillFoot} onChange={(e) => setModalPlayer({ ...modalPlayer, skillFoot: e.target.value })} className="w-full p-3 bg-gray-700 text-white rounded-xl border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input type="number" placeholder="Talla de Calzado (UK)" value={modalPlayer.shoeSize} onChange={(e) => setModalPlayer({ ...modalPlayer, shoeSize: e.target.value })} className="w-full p-3 bg-gray-700 text-white rounded-xl border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input type="number" placeholder="Talla de Guante (US)" value={modalPlayer.gloveSize} onChange={(e) => setModalPlayer({ ...modalPlayer, gloveSize: e.target.value })} className="w-full p-3 bg-gray-700 text-white rounded-xl border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input type="number" placeholder="Altura (cm)" value={modalPlayer.height} onChange={(e) => setModalPlayer({ ...modalPlayer, height: e.target.value })} className="w-full p-3 bg-gray-700 text-white rounded-xl border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input type="number" placeholder="Peso (kg)" value={modalPlayer.weight} onChange={(e) => setModalPlayer({ ...modalPlayer, weight: e.target.value })} className="w-full p-3 bg-gray-700 text-white rounded-xl border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            {/* Datos Profesionales y Financieros */}
            <div className="mb-8 p-4 border border-gray-700 rounded-2xl">
              <h4 className="text-xl font-semibold text-yellow-400 mb-4">Datos Profesionales y Financieros</h4>
              {/* Sección de Agencia */}
              <div className="mb-6 pb-4 border-b border-gray-700">
                <h5 className="text-lg font-medium text-gray-300 mb-3">Agencia</h5>
                <input type="date" placeholder="Fecha de Incorporación" value={modalPlayer.agency.incorporationDate} onChange={(e) => setModalPlayer(prev => ({ ...prev, agency: { ...prev.agency, incorporationDate: e.target.value } }))} className="w-full p-3 mb-4 bg-gray-700 text-white rounded-xl border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <div className="flex items-center justify-between mb-3">
                  <label htmlFor="agencyContract" className="text-gray-400">Contrato con Agencia Activo:</label>
                  <input
                    type="checkbox"
                    id="agencyContract"
                    checked={modalPlayer.agency.contractActive}
                    onChange={(e) => setModalPlayer(prev => ({ ...prev, agency: { ...prev.agency, contractActive: e.target.checked } }))}
                    className="form-checkbox h-5 w-5 text-blue-600 rounded"
                  />
                </div>
                {modalPlayer.agency.contractActive && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <input type="date" placeholder="Fecha de Contrato" value={modalPlayer.agency.contractDate} onChange={(e) => setModalPlayer(prev => ({ ...prev, agency: { ...prev.agency, contractDate: e.target.value } }))} className="w-full p-3 bg-gray-700 text-white rounded-xl border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <input type="number" placeholder="Duración (meses)" value={modalPlayer.agency.contractDuration} onChange={(e) => setModalPlayer(prev => ({ ...prev, agency: { ...prev.agency, contractDuration: e.target.value } }))} className="w-full p-3 bg-gray-700 text-white rounded-xl border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Subir Contrato PDF:</label>
                      <input type="file" accept=".pdf" onChange={handlePdfFileChange} className="w-full text-white text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600" />
                      {modalPlayer.agency.contractPdfFile && <p className="text-gray-500 text-sm mt-1">Archivo seleccionado: {modalPlayer.agency.contractPdfFile.name}</p>}
                      {modalPlayer.agency.contractPdfUrl && !modalPlayer.agency.contractPdfFile && <p className="text-gray-500 text-sm mt-1">PDF existente: <a href={modalPlayer.agency.contractPdfUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Ver</a></p>}
                    </div>
                  </div>
                )}
              </div>
              {/* Sección de Club */}
              <div className="mb-6 pb-4 border-b border-gray-700">
                <h5 className="text-lg font-medium text-gray-300 mb-3">Club</h5>
                <input type="text" placeholder="Club Actual" value={modalPlayer.club.name} onChange={(e) => setModalPlayer(prev => ({ ...prev, club: { ...prev.club, name: e.target.value } }))} className="w-full p-3 mb-4 bg-gray-700 text-white rounded-xl border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input type="text" placeholder="Posición en el Club" value={modalPlayer.club.position} onChange={(e) => setModalPlayer(prev => ({ ...prev, club: { ...prev.club, position: e.target.value } }))} className="w-full p-3 mb-4 bg-gray-700 text-white rounded-xl border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <div className="flex items-center justify-between mb-3">
                  <label htmlFor="clubContract" className="text-gray-400">Contrato con Club Activo:</label>
                  <input
                    type="checkbox"
                    id="clubContract"
                    checked={modalPlayer.club.contractActive}
                    onChange={(e) => setModalPlayer(prev => ({ ...prev, club: { ...prev.club, contractActive: e.target.checked } }))}
                    className="form-checkbox h-5 w-5 text-blue-600 rounded"
                  />
                </div>
                {modalPlayer.club.contractActive && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <input type="date" placeholder="Fecha de Contrato del Club" value={modalPlayer.club.contractDate} onChange={(e) => setModalPlayer(prev => ({ ...prev, club: { ...prev.club, contractDate: e.target.value } }))} className="w-full p-3 bg-gray-700 text-white rounded-xl border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <input type="number" placeholder="Duración Club (meses)" value={modalPlayer.club.contractDuration} onChange={(e) => setModalPlayer(prev => ({ ...prev, club: { ...prev.club, contractDuration: e.target.value } }))} className="w-full p-3 bg-gray-700 text-white rounded-xl border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                )}
                <input type="number" placeholder="Salario" value={modalPlayer.club.salary} onChange={(e) => setModalPlayer(prev => ({ ...prev, club: { ...prev.club, salary: e.target.value } }))} className="w-full p-3 mt-4 mb-4 bg-gray-700 text-white rounded-xl border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input type="number" placeholder="Comisión (%)" value={modalPlayer.club.commissionPercentage} onChange={(e) => setModalPlayer(prev => ({ ...prev, club: { ...prev.club, commissionPercentage: e.target.value } }))} className="w-full p-3 mb-4 bg-gray-700 text-white rounded-xl border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input type="number" placeholder="Monto Fijo de Comisión" value={modalPlayer.club.commissionFixed} onChange={(e) => setModalPlayer(prev => ({ ...prev, club: { ...prev.club, commissionFixed: e.target.value } }))} className="w-full p-3 mb-4 bg-gray-700 text-white rounded-xl border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input type="url" placeholder="URL Perfil Transfermarkt" value={modalPlayer.club.transfermarktProfile} onChange={(e) => setModalPlayer(prev => ({ ...prev, club: { ...prev.club, transfermarktProfile: e.target.value } }))} className="w-full p-3 mb-4 bg-gray-700 text-white rounded-xl border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input type="text" placeholder="Valoración Transfermarkt" value={modalPlayer.club.transfermarktValuation} onChange={(e) => setModalPlayer(prev => ({ ...prev, club: { ...prev.club, transfermarktValuation: e.target.value } }))} className="w-full p-3 bg-gray-700 text-white rounded-xl border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              {/* Sección Otros */}
              <div>
                <h5 className="text-lg font-medium text-gray-300 mb-3">Otros</h5>
                <input type="text" placeholder="Dirección" value={modalPlayer.other.address} onChange={(e) => setModalPlayer(prev => ({ ...prev, other: { ...prev.other, address: e.target.value } }))} className="w-full p-3 mb-4 bg-gray-700 text-white rounded-xl border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input type="tel" placeholder="Teléfono" value={modalPlayer.other.phone} onChange={(e) => setModalPlayer(prev => ({ ...prev, other: { ...prev.other, phone: e.target.value } }))} className="w-full p-3 mb-4 bg-gray-700 text-white rounded-xl border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input type="email" placeholder="Correo Electrónico de Contacto" value={modalPlayer.other.email} onChange={(e) => setModalPlayer(prev => ({ ...prev, other: { ...prev.other, email: e.target.value } }))} className="w-full p-3 mb-4 bg-gray-700 text-white rounded-xl border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input type="url" placeholder="URL de Instagram" value={modalPlayer.other.instagram} onChange={(e) => setModalPlayer(prev => ({ ...prev, other: { ...prev.other, instagram: e.target.value } }))} className="w-full p-3 mb-4 bg-gray-700 text-white rounded-xl border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-400 mb-2">Fotos (máx. 3):</label>
                  {modalPlayer.other.photoUrls && modalPlayer.other.photoUrls.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {modalPlayer.other.photoUrls.map((url, idx) => (
                        <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-600">
                          <img src={url} alt={`Vista previa ${idx + 1}`} className="w-full h-full object-cover" />
                          <button
                            onClick={() => {
                              setModalPlayer(prev => {
                                const newPhotoUrls = prev.other.photoUrls.filter((_, i) => i !== idx);
                                return { ...prev, other: { ...prev.other, photoUrls: newPhotoUrls } };
                              });
                            }}
                            className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 text-xs"
                            title="Eliminar foto existente"
                          >
                            X
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {[0, 1, 2].map((index) => (
                    <input key={index} type="file" accept="image/*" onChange={(e) => handlePhotoFileChange(e, index)} className="w-full text-white text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-500 file:text-white hover:file:bg-purple-600" />
                  ))}
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-400 mb-2">Enlaces de Video:</label>
                  {modalPlayer.other.videoLinks.map((link, index) => (
                    <div key={index} className="flex items-center mb-2">
                      <input
                        type="url"
                        placeholder={`Enlace de Video ${index + 1}`}
                        value={link}
                        onChange={(e) => handleVideoLinkChange(e, index)}
                        className="w-full p-3 bg-gray-700 text-white rounded-xl border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 mr-2"
                      />
                      {modalPlayer.other.videoLinks.length > 1 && (
                        <button
                          onClick={() => removeVideoLinkField(index)}
                          className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-full transition-colors duration-200 ml-4"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={addVideoLinkField}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full text-sm mt-2 transition-all duration-300 transform hover:scale-105"
                  >
                    Agregar Enlace de Video
                  </button>
                </div>
              </div>
            </div>
            <button
              onClick={handleSavePlayer}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all duration-300 shadow-lg transform hover:scale-105"
            >
              {editingPlayer ? 'Guardar Cambios' : 'Crear Jugador'}
            </button>
            {editingPlayer && (
              <button
                onClick={() => handleDeletePlayer(editingPlayer.id, editingPlayer.agency?.contractPdfUrl, editingPlayer.other?.photoUrls)}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-all duration-300 shadow-lg mt-4 transform hover:scale-105"
              >
                Eliminar Jugador
              </button>
            )}
          </div>
        </div>
      )}
      {players.length === 0 ? (
        <p className="text-gray-400 text-center mt-8">No hay jugadores registrados. Agrega uno para empezar.</p>
      ) : (
        <div className="overflow-x-auto bg-gray-800 rounded-3xl shadow-xl border border-gray-700">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Nombre</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Club</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Posición</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Balance Personal</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Vencimiento Contrato</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {players.map(player => {
                const contractExpiringSoon = player.agency.contractActive && isExpiringSoon(player.agency.contractDate, player.agency.contractDuration);
                return (
                  <tr key={player.id} className="hover:bg-gray-700 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">{player.name}</div>
                      <div className="text-xs text-gray-400">RUT: {player.rut}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">{player.club?.name || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">{player.club?.position || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-bold ${getPlayerBalance(player.id) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        ${getPlayerBalance(player.id).toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${contractExpiringSoon ? 'text-red-400 font-semibold' : 'text-gray-300'}`}>
                        {player.agency.contractActive ? getContractExpirationDate(player.agency.contractDate, player.agency.contractDuration) : 'N/A'}
                        {contractExpiringSoon && (
                          <span className="ml-2 px-2 py-0.5 text-xs font-semibold text-white bg-orange-500 rounded-full">
                            ¡Alerta!
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => { setShowAddPlayerModal(true); setEditingPlayer(player); }}
                        className="text-blue-500 hover:text-blue-700 px-3 py-1 rounded-full border border-blue-500 hover:border-blue-700 transition-colors duration-200"
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// Finance management component.
const FinanceManager = ({ db, userId, currentAppId }) => {
  const [finances, setFinances] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newTransaction, setNewTransaction] = useState({
    playerId: '',
    type: 'income',
    description: '',
    amount: ''
  });

  const getFinancesCollectionPath = (appId) => {
    // Usamos el path de datos públicos para la colaboración
    return appId ? `artifacts/${appId}/public/data/finances` : `public/data/finances`;
  };
  const getPlayersCollectionPath = (appId) => {
    // Usamos el path de datos públicos para la colaboración
    return appId ? `artifacts/${appId}/public/data/players` : `public/data/players`;
  };

  useEffect(() => {
    if (!db) return;
    setLoading(true);
    setError(null);
    const playersCollectionRef = collection(db, getPlayersCollectionPath(currentAppId));
    const unsubscribePlayers = onSnapshot(playersCollectionRef, (snapshot) => {
      const playersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPlayers(playersData);
    }, (err) => {
      console.error("Error al cargar jugadores para finanzas:", err);
      setError("No se pudieron cargar los jugadores para finanzas.");
    });
    const financesCollectionRef = collection(db, getFinancesCollectionPath(currentAppId));
    const unsubscribeFinances = onSnapshot(financesCollectionRef, (snapshot) => {
      const financesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setFinances(financesData);
      setLoading(false);
    }, (err) => {
      console.error("Error al cargar finanzas:", err);
      setError("No se pudieron cargar las finanzas.");
      setLoading(false);
    });
    return () => {
      unsubscribePlayers();
      unsubscribeFinances();
    };
  }, [db, currentAppId]);

  const handleAddTransaction = async () => {
    if (!newTransaction.playerId || !newTransaction.description || !newTransaction.amount) {
      setError("Por favor, completa todos los campos de la transacción.");
      return;
    }
    try {
      await addDoc(collection(db, getFinancesCollectionPath(currentAppId)), {
        ...newTransaction,
        amount: parseFloat(newTransaction.amount)
      });
      setNewTransaction({ playerId: '', type: 'income', description: '', amount: '' });
      setError(null);
    } catch (e) {
      console.error("Error al agregar transacción:", e);
      setError("No se pudo agregar la transacción.");
    }
  };

  const handleDeleteTransaction = async (id) => {
    try {
      const financeDocRef = doc(db, getFinancesCollectionPath(currentAppId), id);
      await deleteDoc(financeDocRef);
    } catch (e) {
      console.error("Error al eliminar transacción:", e);
      setError("No se pudo eliminar la transacción.");
    }
  };

  if (loading) return <div className="text-white text-center mt-8">Cargando datos financieros...</div>;
  if (error) return <div className="bg-red-800 text-red-200 p-4 rounded-lg text-center mx-4 mt-4">{error}</div>;

  const playerMap = players.reduce((map, player) => {
    map[player.id] = player.name;
    return map;
  }, {});

  const totalIncome = finances
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = finances
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalBalance = totalIncome - totalExpenses;

  return (
    <div className="p-4 md:p-8 bg-gray-900 text-white min-h-screen">
      <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-6">Gestión de Finanzas</h2>
      {/* Resumen Financiero */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 text-center">
        <div className="bg-gray-800 p-6 rounded-3xl shadow-xl border border-gray-700">
          <h3 className="text-xl text-green-400 font-semibold">Ingresos Totales</h3>
          <p className="text-2xl font-bold">${totalIncome.toFixed(2)}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-3xl shadow-xl border border-gray-700">
          <h3 className="text-xl text-red-400 font-semibold">Gastos Totales</h3>
          <p className="text-2xl font-bold">${totalExpenses.toFixed(2)}</p>
        </div>
        <div className="bg-gray-800 p-6 rounded-3xl shadow-xl border border-gray-700">
          <h3 className="text-xl text-blue-400 font-semibold">Balance Total</h3>
          <p className="text-2xl font-bold">${totalBalance.toFixed(2)}</p>
        </div>
      </div>
      {/* Formulario Nueva Transacción */}
      <div className="bg-gray-800 p-6 rounded-3xl shadow-xl border border-gray-700 mb-8">
        <h3 className="text-2xl font-bold text-white mb-4">Nueva Transacción</h3>
        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select
            value={newTransaction.playerId}
            onChange={(e) => setNewTransaction({ ...newTransaction, playerId: e.target.value })}
            className="w-full p-3 bg-gray-700 text-white rounded-xl border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">Selecciona un jugador</option>
            {players.map(player => (
              <option key={player.id} value={player.id}>{player.name}</option>
            ))}
          </select>
          <select
            value={newTransaction.type}
            onChange={(e) => setNewTransaction({ ...newTransaction, type: e.target.value })}
            className="w-full p-3 bg-gray-700 text-white rounded-xl border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="income">Ingreso</option>
            <option value="expense">Gasto</option>
          </select>
          <input
            type="text"
            placeholder="Descripción"
            value={newTransaction.description}
            onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
            className="w-full p-3 bg-gray-700 text-white rounded-xl border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <input
            type="number"
            placeholder="Monto"
            value={newTransaction.amount}
            onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
            className="w-full p-3 bg-gray-700 text-white rounded-xl border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <button
          onClick={handleAddTransaction}
          className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all duration-300 shadow-lg transform hover:scale-105"
        >
          Agregar Transacción
        </button>
      </div>
      {/* Lista de Transacciones */}
      <div className="bg-gray-800 p-6 rounded-3xl shadow-xl border border-gray-700">
        <h3 className="text-2xl font-bold text-white mb-4">Historial de Transacciones</h3>
        {finances.length === 0 ? (
          <p className="text-gray-400 text-center">No hay transacciones registradas.</p>
        ) : (
          <div className="space-y-4">
            {finances.map(transaction => (
              <div key={transaction.id} className="bg-gray-700 p-4 rounded-xl flex justify-between items-center transition-transform hover:scale-105 duration-200">
                <div className="flex-1">
                  <p className="font-semibold text-lg text-white">{transaction.description}</p>
                  <p className="text-sm text-gray-400">Jugador: {playerMap[transaction.playerId] || 'No asignado'}</p>
                </div>
                <div className={`font-bold text-xl ml-4 ${transaction.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                  {transaction.type === 'income' ? '+' : '-'} ${transaction.amount.toFixed(2)}
                </div>
                <button
                  onClick={() => handleDeleteTransaction(transaction.id)}
                  className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-full transition-colors duration-200 ml-4"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Other view component.
const OtherView = ({ db, currentAppId }) => {
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // Helper to build the player collection path safely.
    const getPlayersCollectionPath = (appId) => {
        return appId ? `artifacts/${appId}/public/data/players` : `public/data/players`;
    };
    // Helper to format the date to DD/MM/YYYY, fixing the one-day shift issue.
    const formatDateForDisplay = (dateString) => {
        if (!dateString) return 'N/A';
        const parts = dateString.split('-');
        // Ensure the date is created using local time, not UTC.
        // This prevents the timezone shift.
        const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };
    useEffect(() => {
        if (!db) return;
        setLoading(true);
        setError(null);
        const playersCollectionRef = collection(db, getPlayersCollectionPath(currentAppId));
        const unsubscribe = onSnapshot(playersCollectionRef, (snapshot) => {
            const playersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setPlayers(playersData);
            setLoading(false);
        }, (err) => {
            console.error("Error al cargar jugadores para la vista 'Otros':", err);
            setError("No se pudieron cargar los datos de los jugadores.");
            setLoading(false);
        });
        return () => unsubscribe();
    }, [db, currentAppId]);
    if (loading) return <div className="text-white text-center mt-8">Cargando datos...</div>;
    if (error) return <div className="bg-red-800 text-red-200 p-4 rounded-lg text-center mx-4 mt-4">{error}</div>;
    const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    // Filter players who have a birth date and sort them by month and then day
    const playersWithBirthdays = players.filter(p => p.birthDate);
    const sortedPlayers = playersWithBirthdays.sort((a, b) => {
        const dateA = new Date(a.birthDate + 'T00:00:00'); // Add T00:00:00 to force local time
        const dateB = new Date(b.birthDate + 'T00:00:00');
        const monthA = dateA.getMonth();
        const monthB = dateB.getMonth();
        const dayA = dateA.getDate();
        const dayB = dateB.getDate();
        if (monthA !== monthB) {
            return monthA - monthB;
        }
        return dayA - dayB;
    });
    const groupedBirthdays = sortedPlayers.reduce((acc, player) => {
        const date = new Date(player.birthDate + 'T00:00:00');
        const monthIndex = date.getMonth();
        const monthName = months[monthIndex];
        if (!acc[monthName]) {
            acc[monthName] = [];
        }
        acc[monthName].push(player);
        return acc;
    }, {});
    
    return (
        <div className="p-4 md:p-8 bg-gray-900 text-white min-h-screen">
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-6">Otros</h2>
            {/* Próximos Cumpleaños Section */}
            <div className="bg-gray-800 p-6 rounded-3xl shadow-xl border border-gray-700 mb-8">
                <h3 className="text-2xl font-bold text-white mb-4">Próximos Cumpleaños</h3>
                {Object.keys(groupedBirthdays).length === 0 ? (
                    <p className="text-gray-400">No hay cumpleaños registrados.</p>
                ) : (
                    Object.entries(groupedBirthdays).map(([month, playersInMonth]) => (
                        <div key={month} className="mb-6">
                            <h4 className="text-xl font-semibold text-blue-400 mb-2">{month}</h4>
                            <div className="space-y-2">
                                {playersInMonth.map(player => (
                                    <div key={player.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-xl transition-all duration-200 hover:bg-gray-600">
                                        <div className="flex items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-300 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h8m-11 0h12a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2z" />
                                            </svg>
                                            <span className="text-white">{player.name}</span>
                                        </div>
                                        <span className="font-medium text-gray-300">{formatDateForDisplay(player.birthDate)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
            {/* Other Section (Pending) */}
            <div className="bg-gray-800 p-6 rounded-3xl shadow-xl border border-gray-700">
                <h3 className="text-2xl font-bold text-white mb-4">Sección Pendiente</h3>
                <p className="text-gray-400">Esta sección se puede utilizar para futuras funcionalidades. ¡Avísame si tienes más ideas!</p>
            </div>
        </div>
    );
};

const App = () => {
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState('Home');
  useEffect(() => {
    // Enable debug logs for Firebase, this is useful for debugging issues
    setLogLevel('debug');
    
    const initializeFirebase = async () => {
        try {
            // Log the received configuration for debugging purposes.
            console.log("Configuración de Firebase recibida:", firebaseConfig);
            if (!firebaseConfig.apiKey) {
                console.error("Firebase Initialization Error: API Key not found in configuration.");
                setError("No se pudo iniciar Firebase. La clave de API es inválida o no se proporcionó. Por favor, asegúrate de que el entorno de la plataforma la esté inyectando correctamente.");
                setLoading(false);
                return;
            }
            const app = initializeApp(firebaseConfig);
            const authInstance = getAuth(app);
            const dbInstance = getFirestore(app);
            const storageInstance = getStorage(app);
            setAuth(authInstance);
            setDb(dbInstance);
            // Handle authentication state
            const unsubscribe = onAuthStateChanged(authInstance, (user) => {
                if (user) {
                    setIsAuthenticated(true);
                    setUserId(user.uid);
                } else {
                    setIsAuthenticated(false);
                    setUserId(null); // Ensure userId is null if not authenticated
                }
                setLoading(false); // Always stop loading after checking authentication
            });
            // Clean up the auth listener
            return () => unsubscribe();
        } catch (e) {
            console.error("Error initializing Firebase:", e);
            setError(`No se pudo iniciar Firebase. Revisa si tu configuración de Firebase es correcta. Error: ${e.message}`);
            setLoading(false);
        }
    };
    initializeFirebase();
  }, []); // Empty dependencies to run only once on component mount
  const handleLoginSuccess = () => {
    // onAuthStateChanged will fire and update authentication status
    // We don't need to do anything here beyond ensuring the flow continues
  };
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUserId(null); // Clear userId
      setCurrentPage('Home');
    } catch (e) {
      console.error("Error al cerrar sesión:", e);
      setError("No se pudo cerrar la sesión correctamente.");
    }
  };
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-700">
          <div className="text-gray-300">Cargando aplicación...</div>
        </div>
      );
    }
    if (error) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-700 p-4 text-center">
            <div className="bg-red-800 border border-red-600 text-red-200 px-6 py-4 rounded-lg shadow-xl w-full max-w-lg">
                <strong className="font-bold text-xl block mb-2">Error Crítico:</strong>
                <p className="text-lg">{error}</p>
                <p className="text-sm mt-4">Por favor, revisa la consola para más detalles técnicos sobre el problema de inicialización de Firebase.</p>
            </div>
        </div>
      );
    }
    if (!isAuthenticated) {
      // Pass onLoginSuccess so LoginScreen can notify App
      return <LoginScreen auth={auth} onLoginSuccess={handleLoginSuccess} />;
    }
    switch (currentPage) {
      case 'Home':
        return <HomeView />;
      case 'PlayerManagement':
        return <PlayerManager db={db} userId={userId} currentAppId={currentAppId} />;
      case 'FinanceManagement':
        return <FinanceManager db={db} userId={userId} currentAppId={currentAppId} />;
      case 'Other':
        return <OtherView db={db} currentAppId={currentAppId} />;
      default:
        return <HomeView />;
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-700 font-inter antialiased text-gray-100">
      {isAuthenticated && <Navbar setCurrentPage={setCurrentPage} handleLogout={handleLogout} />}
      <main className="container mx-auto py-8">
        {renderContent()}
      </main>
    </div>
  );
};
export default App;
