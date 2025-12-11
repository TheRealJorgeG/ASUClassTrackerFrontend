import React, { useEffect, useState } from "react";
import { FaTrash, FaPlus, FaEye, FaClock, FaMapMarkerAlt, FaUser, FaCalendarAlt, FaExclamationTriangle, FaHashtag, FaCalendar } from "react-icons/fa";
import { useNavigate } from "react-router-dom"; 
import config from "../config/api";
import Modal from "./Modal";

const ClassesPage = () => {
  const [classes, setClasses] = useState([]);
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  
  // -- STATE FOR DELETE CONFIRMATION --
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [classToDelete, setClassToDelete] = useState(null);

  const [newClassNumber, setNewClassNumber] = useState("");
  const [previewClass, setPreviewClass] = useState(null);
  
  // Loading states
  const [previewLoading, setPreviewLoading] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  
  const [errorMessage, setErrorMessage] = useState("");
  
  // Session Expiration State
  const [isSessionExpired, setIsSessionExpired] = useState(false);

  const navigate = useNavigate();
  const MAX_CLASSES = 3;

  const handleSessionExpired = () => {
    setIsSessionExpired(false);
    localStorage.removeItem("token"); 
    navigate("/auth"); 
  };

  useEffect(() => {
    const fetchClasses = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setPageLoading(false);
        return;
      }

      try {
        const response = await fetch(`${config.API_BASE_URL}/api/classes`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 401) {
          setIsSessionExpired(true);
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to fetch classes");
        }

        const data = await response.json();
        setClasses(data);
      } catch (error) {
        console.error(error);
      } finally {
        setPageLoading(false);
      }
    };

    fetchClasses();
  }, []);

  const handleDelete = (classId) => {
    setClassToDelete(classId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!classToDelete) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(
        `${config.API_BASE_URL}/api/classes/${classToDelete}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401) {
        setIsSessionExpired(true);
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to delete class");
      }

      setClasses(classes.filter((cls) => cls._id !== classToDelete));
    } catch (error) {
      console.error(error);
    } finally {
      setShowDeleteModal(false);
      setClassToDelete(null);
    }
  };

  const handlePreview = async () => {
    const token = localStorage.getItem("token");
    if (!token || !newClassNumber) return;

    setPreviewLoading(true);
    setPreviewClass(null);
    setErrorMessage("");

    try {
      const response = await fetch(
        `${config.API_BASE_URL}/api/classes/lookup`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ number: newClassNumber }),
        }
      );

      if (response.status === 401) {
        setIsSessionExpired(true);
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to preview class");
      }

      const data = await response.json();
      setPreviewClass(data);
    } catch (error) {
      console.error(error);
      if (!isSessionExpired) {
        setErrorMessage(error.message || "Failed to preview class. Please try again.");
      }
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleAddClass = async () => {
    if (!previewClass) {
      setErrorMessage("Please preview the class before adding.");
      return;
    }

    setAddLoading(true);
    setErrorMessage("");

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(`${config.API_BASE_URL}/api/classes`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(previewClass),
      });

      if (response.status === 401) {
        setIsSessionExpired(true);
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add class");
      }

      const data = await response.json();
      setClasses([...classes, data]);
      setShowAddClassModal(false);
      setNewClassNumber("");
      setPreviewClass(null);
      setErrorMessage("");
    } catch (error) {
      console.error(error);
      if (!isSessionExpired) {
        setErrorMessage(error.message || "Failed to add class. Please try again.");
      }
    } finally {
      setAddLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowAddClassModal(false);
    setNewClassNumber("");
    setPreviewClass(null);
    setErrorMessage("");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const isExpiringSoon = (expirationDate) => {
    if (!expirationDate) return false;
    const now = new Date();
    const expiration = new Date(expirationDate);
    const daysUntilExpiration = (expiration - now) / (1000 * 60 * 60 * 24);
    return daysUntilExpiration > 0 && daysUntilExpiration <= 7;
  };

  const getDaysUntilExpiration = (expirationDate) => {
    if (!expirationDate) return null;
    const now = new Date();
    const expiration = new Date(expirationDate);
    const days = Math.ceil((expiration - now) / (1000 * 60 * 60 * 24));
    return days;
  };

  const activeClasses = classes.filter(cls => !cls.isExpired);
  const expiredClasses = classes.filter(cls => cls.isExpired);
  const maxClassesReached = activeClasses.length >= MAX_CLASSES;

  if (pageLoading) {
    return (
      <div className="min-h-screen text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#ffcb25]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white">
      {/* Session Expired Modal */}
      <Modal 
        isOpen={isSessionExpired} 
        onClose={handleSessionExpired}
        title="Session Expired"
        message="Your session has expired. Please log in again to continue."
        type="error"
      />

      {/* --- DELETE CONFIRMATION MODAL --- */}
      {showDeleteModal && (
        <div 
          className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/60 backdrop-blur-sm transition-all duration-100"
          onClick={() => setShowDeleteModal(false)}
        >
          <div 
            className="relative bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden transform scale-100"
            onClick={e => e.stopPropagation()}
          >
            {/* Top Decorative Gradient */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#A23A56] to-[#ffcb25]"></div>

            <div className="p-8 text-center">
              {/* Icon Circle */}
              <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-6 bg-red-100">
                <FaTrash className="w-8 h-8 text-[#A23A56]" />
              </div>

              <h3 className="text-2xl font-black text-gray-800 mb-2 tracking-tight">
                Remove Class?
              </h3>

              <p className="text-gray-500 font-medium mb-8 leading-relaxed">
                Are you sure you want to remove this class from your tracked classes?
              </p>

              {/* BUTTONS SWAPPED HERE */}
              <div className="flex gap-3">
                <button
                  onClick={confirmDelete}
                  className="flex-1 py-3.5 bg-[#92223D] hover:bg-[#6b1a2f] text-white rounded-xl font-bold text-lg shadow-lg transition-all duration-200"
                >
                  Remove
                </button>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-lg transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 text-[#ffcb25]">Your Tracked Classes</h1>
          <p className="text-xl text-gray-200">Monitor your classes and get notified when spots open up</p>
          {expiredClasses.length > 0 && (
            <div className="mt-4 inline-flex items-center gap-2 bg-orange-500/20 text-orange-300 px-4 py-2 rounded-lg">
              <FaExclamationTriangle />
              <span>{expiredClasses.length} expired {expiredClasses.length === 1 ? 'class' : 'classes'}</span>
            </div>
          )}
        </div>

        {/* Active Classes */}
        {activeClasses.length > 0 && (
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-6 text-white">Active Classes</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {activeClasses.map((cls) => {
                const daysLeft = getDaysUntilExpiration(cls.expirationDate);
                const expiringSoon = isExpiringSoon(cls.expirationDate);
                
                return (
                  <div
                    key={cls._id}
                    className={`bg-white/10 backdrop-blur-sm rounded-xl p-6 shadow-2xl border ${
                      expiringSoon ? 'border-orange-400/50' : 'border-white/20'
                    } hover:transform hover:scale-105 transition-all duration-300`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-[#ffcb25] mb-2">{cls.title}</h3>
                        <p className="text-gray-200 font-medium">{cls.course}</p>
                      </div>
                      <button
                        onClick={() => handleDelete(cls._id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/20 p-2 rounded-lg transition-all duration-200"
                      >
                        <FaTrash size={16} />
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-gray-300">
                        <FaUser className="mr-2 text-[#ffcb25]" />
                        <span>{cls.instructors.join(", ")}</span>
                      </div>

                      <div className="flex items-center text-sm text-gray-300">
                        <FaHashtag className="mr-2 text-[#ffcb25]" />
                        <span>{cls.number}</span>
                      </div>

                      <div className="flex items-center text-sm text-gray-300">
                        <FaCalendarAlt className="mr-2 text-[#ffcb25]" />
                        <span>{cls.dates && cls.dates !== "N/A" ? cls.dates : "Dates TBD"}</span>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-300">
                        <FaCalendar className="mr-2 text-[#ffcb25]" />
                        <span>{cls.days && cls.days !== "N/A" ? cls.days : "Days TBD"}</span>
                      </div>

                      <div className="flex items-center text-sm text-gray-300">
                        <FaClock className="mr-2 text-[#ffcb25]" />
                        <span>{cls.time && cls.time !== "N/A" ? cls.time : "Time TBD"}</span>
                      </div>

                      <div className="flex items-center text-sm text-gray-300">
                        <FaMapMarkerAlt className="mr-2 text-[#ffcb25]" />
                        <span>{cls.location && cls.location !== "N/A" ? cls.location : "Location TBD"}</span>
                      </div>

                      {cls.session && cls.session !== "Unknown" && (
                        <div className="pt-2 border-t border-white/20">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-300">Session {cls.session}</span>
                            {cls.expirationDate && (
                              <span className={`font-medium ${
                                expiringSoon ? 'text-orange-400' : 'text-gray-300'
                              }`}>
                                {daysLeft > 0 ? `${daysLeft} days left` : 'Expires today'}
                              </span>
                            )}
                          </div>
                          {cls.expirationDate && (
                            <div className="text-xs text-gray-300 mt-1">
                              Expires: {formatDate(cls.expirationDate)}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="pt-2 border-t border-white/20">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          cls.seatStatus === 'Open' ? 'bg-green-500/20 text-green-300' : 
                          cls.seatStatus === 'Waitlist' ? 'bg-yellow-500/20 text-yellow-300' :
                          'bg-red-500/20 text-red-300'
                        }`}>
                          {cls.seatStatus}
                        </span>
                        <span className="ml-2 text-sm text-gray-400">{cls.units && cls.units !== "N/A" ? `${cls.units} units` : "Units TBD"}</span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {!maxClassesReached && (
                <div
                  onClick={() => setShowAddClassModal(true)}
                  className="bg-white/5 backdrop-blur-sm rounded-xl p-6 shadow-2xl border-2 border-dashed border-white/30 hover:border-[#ffcb25] hover:bg-white/10 cursor-pointer transition-all duration-300 flex flex-col items-center justify-center min-h-[200px] group"
                >
                  <FaPlus className="text-4xl text-[#ffcb25] mb-4 group-hover:scale-110 transition-transform duration-300" />
                  <h3 className="text-xl font-bold text-[#ffcb25] mb-2">Add New Class</h3>
                  <p className="text-gray-300 text-center">Track a new class and get notified when spots open</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Expired Classes */}
        {expiredClasses.length > 0 && (
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-6 text-gray-400">Expired Classes</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {expiredClasses.map((cls) => (
                <div
                  key={cls._id}
                  className="bg-white/5 backdrop-blur-sm rounded-xl p-6 shadow-2xl border border-red-500/30 opacity-60"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <FaExclamationTriangle className="text-red-400" />
                        <span className="text-sm text-red-400 font-semibold">EXPIRED</span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-400 mb-2">{cls.title}</h3>
                      <p className="text-gray-500 font-medium">{cls.course}</p>
                    </div>
                    <button
                      onClick={() => handleDelete(cls._id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/20 p-2 rounded-lg transition-all duration-200"
                    >
                      <FaTrash size={16} />
                    </button>
                  </div>

                  <div className="space-y-2 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <FaHashtag className="text-gray-600" />
                      <span>Class # {cls.number}</span>
                    </div>
                    <div>Expired: {formatDate(cls.expirationDate)}</div>
                    <div>Session {cls.session}</div>
                    <div className="pt-2 text-xs">
                      This class is no longer being monitored for seat availability.
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {classes.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl text-gray-400 mb-4">📚</div>
            <h3 className="text-2xl font-bold text-gray-300 mb-2">No Classes Tracked Yet</h3>
            <p className="text-gray-400 mb-6">Start by adding your first class to track</p>
            <button
              onClick={() => setShowAddClassModal(true)}
              className="bg-[#ffcb25] hover:bg-[#e6b622] text-[#92223D] font-bold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105"
            >
              Add Your First Class
            </button>
          </div>
        )}

        {/* Add Class Modal */}
        {showAddClassModal && (
          <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-6 text-[#92223D]">Add New Class</h2>
              
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">Class Number</label>
                <input
                  type="text"
                  placeholder="e.g., 12345"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#92223D] focus:border-transparent text-gray-900"
                  value={newClassNumber}
                  onChange={(e) => {
                    setNewClassNumber(e.target.value);
                    setErrorMessage(""); 
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !previewLoading && !addLoading) {
                      handlePreview();
                    }
                  }}
                />
                
                {errorMessage && (
                  <p className="text-red-500 text-sm font-medium mt-2">
                    {errorMessage}
                  </p>
                )}
              </div>

              <button
                onClick={handlePreview}
                disabled={previewLoading || addLoading}
                className="w-full py-3 bg-[#92223D] hover:bg-[#6b1a2f] text-white rounded-xl font-medium mb-4 flex items-center justify-center transition-all duration-300 disabled:opacity-50"
              >
                {previewLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <FaEye className="mr-2" />
                    Preview Class
                  </>
                )}
              </button>

              {previewClass && (
                <div className="bg-gray-50 rounded-xl p-4 mb-6 border max-h-64 overflow-y-auto">
                  <h3 className="font-bold text-[#92223D] mb-2">{previewClass.title}</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                    <div><strong>Course:</strong> {previewClass.course}</div>
                    <div><strong>Units:</strong> {previewClass.units}</div>
                    <div><strong>Instructors:</strong> {previewClass.instructors.join(", ")}</div>
                    <div><strong>Days:</strong> {previewClass.days}</div>
                    <div><strong>Time:</strong> {previewClass.startTime} - {previewClass.endTime}</div>
                    <div><strong>Location:</strong> {previewClass.location}</div>
                    <div><strong>Dates:</strong> {previewClass.dates}</div>
                    {previewClass.session && previewClass.session !== "Unknown" && (
                      <>
                        <div><strong>Session:</strong> {previewClass.session}</div>
                        {previewClass.startDate && (
                          <div><strong>Starts:</strong> {formatDate(previewClass.startDate)}</div>
                        )}
                      </>
                    )}
                    <div><strong>Status:</strong> 
                      <span className={`ml-1 px-2 py-1 rounded text-xs ${
                        previewClass.seatStatus === 'Open' ? 'bg-green-100 text-green-800' : 
                        previewClass.seatStatus === 'Waitlist' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {previewClass.seatStatus}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  onClick={handleCloseModal}
                  className="flex-1 py-3 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-xl font-medium transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddClass}
                  disabled={addLoading || previewLoading || !previewClass}
                  className="flex-1 py-3 bg-[#ffcb25] hover:bg-[#e6b622] text-[#92223D] rounded-xl font-medium transition-all duration-300 disabled:opacity-50"
                >
                  {addLoading ? "Adding..." : "Add Class"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassesPage;