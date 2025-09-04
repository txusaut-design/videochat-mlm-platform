// src/app/page.tsx
'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  VideoCameraIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  SparklesIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="relative z-10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-2"
          >
            <VideoCameraIcon className="w-8 h-8 text-primary-500" />
            <span className="text-2xl font-bold gradient-text">VideoChat MLM</span>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-4"
          >
            <Link href="/login">
              <Button variant="ghost" size="medium">
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="primary" size="medium">
                Get Started
              </Button>
            </Link>
          </motion.div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 pt-20 pb-32">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-8">
              Premium <span className="gradient-text">VideoChat</span>
              <br />
              <span className="text-3xl md:text-5xl text-slate-300">
                with Crypto Rewards
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-300 mb-12 max-w-3xl mx-auto">
              Join exclusive video chat rooms and earn USDC through our innovative MLM system. 
              Connect, chat, and get rewarded for growing the community.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/register">
                <Button variant="primary" size="large" className="w-full sm:w-auto">
                  Start Earning Today
                  <ArrowRightIcon className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Button variant="ghost" size="large" className="w-full sm:w-auto">
                Watch Demo
              </Button>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-3 gap-8 mt-20"
          >
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary-400">10 USDC</div>
              <div className="text-slate-400">Monthly Subscription</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-secondary-400">5 Levels</div>
              <div className="text-slate-400">MLM Commission</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-accent-400">7.5 USDC</div>
              <div className="text-slate-400">Total Rewards</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-20 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Why Choose <span className="gradient-text">VideoChat MLM</span>?
            </h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Experience the future of video communication with blockchain-powered rewards
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: VideoCameraIcon,
                title: 'HD Video Rooms',
                description: 'Crystal clear video chat with up to 10 participants per room',
                color: 'text-primary-500'
              },
              {
                icon: CurrencyDollarIcon,
                title: 'USDC Rewards',
                description: 'Earn real cryptocurrency through our innovative MLM system',
                color: 'text-secondary-500'
              },
              {
                icon: UserGroupIcon,
                title: '5-Level Network',
                description: 'Build your network and earn from 5 levels of referrals',
                color: 'text-accent-500'
              },
              {
                icon: ShieldCheckIcon,
                title: 'Blockchain Security',
                description: 'Secure payments powered by Polygon network',
                color: 'text-blue-500'
              },
              {
                icon: SparklesIcon,
                title: 'Instant Rewards',
                description: 'Automatic commission distribution to your wallet',
                color: 'text-purple-500'
              },
              {
                icon: VideoCameraIcon,
                title: 'Premium Experience',
                description: 'Ad-free, high-quality video chat experience',
                color: 'text-pink-500'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card hover className="h-full">
                  <feature.icon className={`w-12 h-12 ${feature.color} mb-4`} />
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-slate-400">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* MLM Structure */}
      <section className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="gradient-text">Earn While You Chat</span>
            </h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Our transparent MLM system rewards you for every referral across 5 levels
            </p>
          </motion.div>

          <Card className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              {[
                { level: 1, commission: '3.5 USDC', color: 'bg-primary-500' },
                { level: 2, commission: '1.0 USDC', color: 'bg-secondary-500' },
                { level: 3, commission: '1.0 USDC', color: 'bg-accent-500' },
                { level: 4, commission: '1.0 USDC', color: 'bg-blue-500' },
                { level: 5, commission: '1.0 USDC', color: 'bg-purple-500' },
              ].map((level) => (
                <motion.div
                  key={level.level}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: level.level * 0.1 }}
                  className="text-center"
                >
                  <div className={`w-16 h-16 ${level.color} rounded-full flex items-center justify-center mx-auto mb-3`}>
                    <span className="text-white font-bold text-xl">{level.level}</span>
                  </div>
                  <div className="text-lg font-bold">Level {level.level}</div>
                  <div className="text-slate-400">{level.commission}</div>
                </motion.div>
              ))}
            </div>
            <div className="text-center mt-8 pt-8 border-t border-slate-700">
              <div className="text-2xl font-bold text-secondary-400">
                Total: 7.5 USDC per referral payment
              </div>
              <div className="text-slate-400 mt-2">
                Platform keeps 2.5 USDC for operations
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 bg-gradient-to-r from-primary-600/20 to-accent-600/20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Start Earning?
            </h2>
            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              Join thousands of users already earning USDC through our platform. 
              Your journey to passive crypto income starts here.
            </p>
            <Link href="/register">
              <Button variant="primary" size="large">
                Join Now - Only 10 USDC/month
                <ArrowRightIcon className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 bg-slate-950 border-t border-slate-800">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <VideoCameraIcon className="w-6 h-6 text-primary-500" />
            <span className="text-xl font-bold gradient-text">VideoChat MLM</span>
          </div>
          <p className="text-slate-400">
            © 2024 VideoChat MLM. Built with ❤️ for the crypto community.
          </p>
        </div>
      </footer>
    </div>
  );
}