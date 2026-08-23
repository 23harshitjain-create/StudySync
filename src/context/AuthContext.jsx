import React, { createContext, useContext, useState, useEffect } from 'react';

import {
  fetchStudents,
  updateStudent as updateStudentApi
} from '../utils/api';

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

  // Switch between demo students
  const switchStudent = (studentId) => {
    const found = students.find((s) => s.id === studentId);

    if (found) {
      setCurrentStudent(found);
    }
  };

  // Update current student's profile
  const updateStudent = async (studentId, updates) => {
    try {
      const updatedStudent = await updateStudentApi(studentId, updates);

      // Update students list
      setStudents((prevStudents) =>
        prevStudents.map((student) =>
          student.id === studentId ? updatedStudent : student
        )
      );

      // Update currently selected student
      setCurrentStudent((prevStudent) =>
        prevStudent && prevStudent.id === studentId
          ? updatedStudent
          : prevStudent
      );

      return updatedStudent;
    } catch (err) {
      console.error('Failed to update student:', err);
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        students,
        currentStudent,
        switchStudent,
        updateStudent,
        loading
      }}
    >
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