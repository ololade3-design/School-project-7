(() => {
    'use strict';

    const count = (id, value) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    };

    const localCount = (key) => {
        try {
            const value = JSON.parse(localStorage.getItem(key));
            return Array.isArray(value) ? value.length : 0;
        } catch {
            return 0;
        }
    };

    const loadStats = async () => {
        const fallback = {
            administratorCount: localCount('adminAccounts'),
            studentCount: localCount('students'),
            lecturerCount: localCount('lecturers'),
            departmentCount: localCount('departments'),
            courseCount: localCount('courses'),
            roomCount: localCount('classrooms') || localCount('rooms')
        };
        Object.entries(fallback).forEach(([id, value]) => count(id, value));

        if (!window.SmartTimetableAPI?.get) return;
        const endpoints = {
            studentCount: '/students',
            lecturerCount: '/lecturers',
            departmentCount: '/departments',
            courseCount: '/courses',
            roomCount: '/lecture-rooms'
        };
        await Promise.all(Object.entries(endpoints).map(async ([id, endpoint]) => {
            try {
                const response = await window.SmartTimetableAPI.get(endpoint);
                count(id, Array.isArray(response.data) ? response.data.length : 0);
            } catch {
                // Keep the local fallback when an individual service is unavailable.
            }
        }));
    };

    const user = window.SmartTimetableAPI?.getUser?.();
    if (user?.fullName) document.getElementById('adminName').textContent = user.fullName;

    document.getElementById('logoutBtn')?.addEventListener('click', (event) => {
        event.preventDefault();
        window.SmartTimetableAPI?.clearSession?.();
        window.location.href = 'login.html';
    });

    loadStats();
})();
