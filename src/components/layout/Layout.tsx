// components/layout/Layout.tsx

import { Header } from './Header';
import { Outlet } from '@tanstack/react-router';

export function Layout() {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
            <Header />
            <main className="flex-grow">
                <Outlet />
            </main>
            <footer className="py-4 px-8 text-center text-gray-500 text-sm border-t">
                <p>Health Tracker © {new Date().getFullYear()}</p>
            </footer>
        </div>
    );
}