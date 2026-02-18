import { Heart, Smartphone } from 'lucide-react';
import styles from './Footer.module.css';

export function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.inner}>
                <div className={styles.top}>
                    <div className={styles.brand}>
                        <div className={styles.logo}>
                            <span className={styles.logoIcon}>🎯</span>
                            <span className={styles.logoText}>SkillLoot</span>
                        </div>
                        <p className={styles.tagline}>
                            Discover free Udemy courses from around the web.
                            Vote to keep the community updated!
                        </p>
                    </div>

                    <div className={styles.links}>
                        <h4 className={styles.linksTitle}>Quick Links</h4>
                        <a href="/">Home</a>
                        <a href="/explore">Explore</a>
                        <a href="/saved">Saved Deals</a>
                        <a href="/profile">My Profile</a>
                    </div>

                    <div className={styles.links}>
                        <h4 className={styles.linksTitle}>Get the App</h4>
                        <a
                            href="https://play.google.com/store/apps/details?id=com.coursedealhunter.app"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.storeLink}
                        >
                            <Smartphone size={16} />
                            Google Play Store
                        </a>
                    </div>
                </div>

                <div className={styles.bottom}>
                    <p>
                        Made with <Heart size={14} fill="#EF4444" stroke="#EF4444" style={{ display: 'inline', verticalAlign: 'middle' }} /> by SkillLoot Team
                    </p>
                    <p>© {new Date().getFullYear()} SkillLoot. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
