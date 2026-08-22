import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchStudents } from '../utils/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [students, setStudents] = useState([]);
  const [currentStudent, setCurrentStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load students from API on mount
  useEffect(() => {
    async function init() {
      try {
        const studentList = await fetchStudents();
        setStudents(studentList);
        if (studentList.length > 0) {
          // Default to first student (Alex Rivera)
          setCurrentStudent(studentList[0]);
        }
      } catch (err) {
        console.error('Failed to load students:', err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  const switchStudent = (studentId) => {
    const found = students.find(s => s.id === studentId);
    if (found) {
      setCurrentStudent(found);
    }
  };

  return (
    <AuthContext.Provider value={{ students, currentStudent, switchStudent, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
