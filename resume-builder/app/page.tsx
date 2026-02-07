'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  FileText,
  Sparkles,
  TrendingUp,
  Download,
  Zap,
  CheckCircle,
  ArrowRight,
  Upload,
  PenTool,
  Star
} from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-500/30 to-cyan-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-gradient-to-br from-indigo-500/30 to-purple-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-6 pt-20 pb-32">
        {/* Animated background */}
        {/* This div was removed as per the instruction to change the background */}
        {/* <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-700"></div>
          <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
        </div> */}

        <div className="relative container mx-auto px-6 py-20">
          {/* Navigation */}
          <nav className="flex justify-between items-center mb-20">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 text-white"
            >
              <FileText className="w-8 h-8 text-blue-400" />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                ResumeAI
              </span>
            </motion.div>
          </nav>

          {/* Hero Content */}
          <div className="text-center max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 rounded-full mb-8"
            >
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span className="text-blue-300 text-sm font-medium">AI-Powered Resume Optimization</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent"
            >
              Create ATS-Optimized Resumes in Minutes
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto"
            >
              Leverage the power of AI to transform your resume. Get instant ATS scores, AI-powered content enhancement, and professional templates that get you noticed.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link
                href="/upload"
                className="group px-8 py-4 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 text-white rounded-xl font-semibold text-lg shadow-lg shadow-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/60 transition-all duration-300 hover:scale-105 flex items-center gap-2"
              >
                <Upload className="w-5 h-5" />
                Upload Resume
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/create"
                className="group px-8 py-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm text-white border-2 border-purple-400/50 rounded-xl font-semibold text-lg hover:bg-gradient-to-r hover:from-purple-500/30 hover:to-pink-500/30 hover:border-purple-400 transition-all duration-300 flex items-center gap-2"
              >
                <PenTool className="w-5 h-5" />
                Create from Scratch
              </Link>
            </motion.div>


          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Everything You Need to Stand Out
            </h2>
            <p className="text-xl text-gray-400">
              Powerful features to create the perfect resume
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <TrendingUp className="w-8 h-8" />,
                title: 'ATS Score Analysis',
                description: 'Get instant feedback on how well your resume performs with Applicant Tracking Systems',
                color: 'from-blue-500 to-cyan-500',
              },
              {
                icon: <Sparkles className="w-8 h-8" />,
                title: 'AI Content Enhancement',
                description: 'OpenAI & Gemini powered suggestions to improve your content and optimize keywords',
                color: 'from-purple-500 to-pink-500',
              },
              {
                icon: <FileText className="w-8 h-8" />,
                title: 'Professional Templates',
                description: 'Choose from ATS-optimized LaTeX templates designed by industry experts',
                color: 'from-green-500 to-emerald-500',
              },
              {
                icon: <Zap className="w-8 h-8" />,
                title: 'Real-time Preview',
                description: 'See changes instantly as you edit and enhance your resume content',
                color: 'from-yellow-500 to-orange-500',
              },
              {
                icon: <CheckCircle className="w-8 h-8" />,
                title: 'Side-by-Side Comparison',
                description: 'Compare original vs enhanced versions to see the improvements',
                color: 'from-red-500 to-pink-500',
              },
              {
                icon: <Download className="w-8 h-8" />,
                title: 'Multiple Formats',
                description: 'Download your resume in both PDF and editable Word formats',
                color: 'from-indigo-500 to-purple-500',
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group relative p-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-300 hover:scale-105"
              >
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.color} mb-4`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-400">
              Four simple steps to your perfect resume
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Upload or Create', description: 'Upload your existing resume or start from scratch' },
              { step: '02', title: 'AI Analysis', description: 'Get your ATS score and improvement suggestions' },
              { step: '03', title: 'Enhance Content', description: 'AI optimizes your content for maximum impact' },
              { step: '04', title: 'Download', description: 'Get your polished resume in PDF and Word' },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative text-center"
              >
                <div className="text-6xl font-bold bg-gradient-to-br from-blue-500/20 to-purple-500/20 bg-clip-text text-transparent mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-gray-400">{item.description}</p>
                {index < 3 && (
                  <div className="hidden md:block absolute top-12 -right-4 w-8 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Transform Your Resume?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of job seekers who have improved their resumes with AI
            </p>
            <Link
              href="/upload"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-slate-900/50 backdrop-blur-sm border-t border-white/10">
        <div className="container mx-auto px-6 text-center text-gray-400">
          <p>&copy; 2026 ResumeAI. Built with AI to help you succeed.</p>
        </div>
      </footer>
    </main>
  );
}
