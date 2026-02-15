'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Heart, User, Menu, X, Smartphone } from 'lucide-react';
import styles from './Header.module.css';

const NAV_ITEMS = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/explore', label: 'Explore', icon: Search },
    { href: '/saved', label: 'Saved', icon: Heart },
    { href: '/profile', label: 'Profile', icon: User },
];

export function Header() {
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <header className={styles.header}>
            <div className={styles.inner}>
                <Link href="/" className={styles.logo}>
                    <span className={styles.logoIcon}>🎯</span>
                    <span className={styles.logoText}>SkillLoot</span>
                </Link>

                <nav className={styles.nav}>
                    {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
                        <Link
                            key={href}
                            href={href}
                            className={`${styles.navLink} ${pathname === href ? styles.navLinkActive : ''}`}
                        >
                            <Icon size={18} />
                            <span>{label}</span>
                        </Link>
                    ))}
                </nav>

                <a
                    href="https://play.google.com/store/apps/details?id=com.hemalmandal.dealfinder"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`btn btn-primary btn-sm ${styles.ctaBtn}`}
                >
                    <Smartphone size={16} />
                    Get the App
                </a>

                <button
                    className={styles.menuBtn}
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    aria-label="Toggle menu"
                >
                    {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {mobileMenuOpen && (
                <div className={styles.mobileMenu}>
                    {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
                        <Link
                            key={href}
                            href={href}
                            className={`${styles.mobileNavLink} ${pathname === href ? styles.mobileNavLinkActive : ''}`}
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            <Icon size={20} />
                            <span>{label}</span>
                        </Link>
                    ))}
                    <a
                        href="https://play.google.com/store/apps/details?id=com.hemalmandal.dealfinder"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`btn btn-primary ${styles.mobileCta}`}
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        <Smartphone size={18} />
                        Get the App
                    </a>
                </div>
            )}
        </header>
    );
}
