'use client';

import { useState, useEffect } from 'react';
import { fetchDeals } from '@/lib/api';
import { getDeviceId } from '@/lib/device';
import { CourseCard } from '@/components/CourseCard';
import { Search, Zap, Users, BookOpen, Smartphone, ArrowRight, TrendingUp, Shield, Star } from 'lucide-react';
import Link from 'next/link';
import styles from './page.module.css';

export default function HomePage() {
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const deviceId = getDeviceId();
      const data = await fetchDeals(0, 6, deviceId);
      setDeals(data);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className={styles.page}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroBadge}>
            <Zap size={14} />
            <span>Updated daily with fresh deals</span>
          </div>
          <h1 className={styles.heroTitle}>
            Discover <span className={styles.heroHighlight}>Free Udemy</span> Courses
          </h1>
          <p className={styles.heroSubtitle}>
            We scour the internet for legitimate free Udemy courses so you don&apos;t have to.
            Save, vote, and level up while learning!
          </p>
          <div className={styles.heroCta}>
            <Link href="/explore" className="btn btn-primary btn-lg">
              <Search size={20} />
              Browse Courses
            </Link>
            <a
              href="https://play.google.com/store/apps/details?id=com.hemalmandal.dealfinder"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-accent btn-lg"
            >
              <Smartphone size={20} />
              Get the App
            </a>
          </div>

          <div className={styles.heroStats}>
            <div className={styles.heroStat}>
              <BookOpen size={20} />
              <span className={styles.heroStatValue}>148+</span>
              <span className={styles.heroStatLabel}>Free Courses</span>
            </div>
            <div className={styles.heroStatDivider} />
            <div className={styles.heroStat}>
              <Users size={20} />
              <span className={styles.heroStatValue}>100+</span>
              <span className={styles.heroStatLabel}>Community Votes</span>
            </div>
            <div className={styles.heroStatDivider} />
            <div className={styles.heroStat}>
              <TrendingUp size={20} />
              <span className={styles.heroStatValue}>Daily</span>
              <span className={styles.heroStatLabel}>New Deals</span>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className={styles.heroDecor1}>🎯</div>
        <div className={styles.heroDecor2}>📚</div>
        <div className={styles.heroDecor3}>🎓</div>
      </section>

      {/* Featured Deals */}
      <section className={styles.section}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2>Today&apos;s Free Courses</h2>
            <Link href="/explore" className={styles.viewAll}>
              View All <ArrowRight size={16} />
            </Link>
          </div>

          {loading ? (
            <div className="grid-deals">
              {[...Array(6)].map((_, i) => (
                <div key={i} className={styles.skeletonCard}>
                  <div className={`skeleton ${styles.skeletonImg}`} />
                  <div className={styles.skeletonContent}>
                    <div className={`skeleton ${styles.skeletonTitle}`} />
                    <div className={`skeleton ${styles.skeletonMeta}`} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid-deals">
              {deals.map((deal, index) => (
                <CourseCard
                  key={deal.id}
                  deal={deal}
                  initialIsSaved={deal.is_saved}
                  index={index}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className={styles.howItWorks}>
        <div className="container">
          <h2 className={styles.sectionTitle}>How SkillLoot Works</h2>
          <div className={styles.stepsGrid}>
            <div className={`card ${styles.stepCard}`}>
              <div className={styles.stepNumber}>1</div>
              <Search size={32} className={styles.stepIcon} />
              <h3>We Find Deals</h3>
              <p>Our scraper scans aggregator sites daily for free Udemy course promotions.</p>
            </div>
            <div className={`card ${styles.stepCard}`}>
              <div className={styles.stepNumber}>2</div>
              <Star size={32} className={styles.stepIcon} />
              <h3>You Save & Vote</h3>
              <p>Save courses you love and vote to verify if deals are still active.</p>
            </div>
            <div className={`card ${styles.stepCard}`}>
              <div className={styles.stepNumber}>3</div>
              <Shield size={32} className={styles.stepIcon} />
              <h3>Community Verifies</h3>
              <p>Votes from the community keep the deal list accurate and up-to-date.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Download App CTA */}
      <section className={styles.appCta}>
        <div className="container">
          <div className={`card card-accent ${styles.appCtaCard}`}>
            <div className={styles.appCtaContent}>
              <h2>Get SkillLoot on Android</h2>
              <p>Get push notifications for the hottest new free courses the moment they drop.</p>
              <a
                href="https://play.google.com/store/apps/details?id=com.hemalmandal.dealfinder"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary btn-lg"
              >
                <Smartphone size={20} />
                Download on Play Store
              </a>
            </div>
            <div className={styles.appCtaVisual}>
              <div className={styles.phoneMockup}>
                <div className={styles.phoneScreen}>
                  <div className={styles.phoneBar} />
                  <div className={styles.phoneCard} />
                  <div className={styles.phoneCard} />
                  <div className={styles.phoneCard} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
