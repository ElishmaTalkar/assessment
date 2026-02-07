'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, User, GraduationCap, Briefcase, Code, Award, PlusCircle, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useResumeStore } from '@/store/resume-store';
import { ResumeData, PersonalInfo, Education, Experience, Project, Skill, Certification } from '@/lib/types';

const steps = [
    { id: 1, name: 'Personal Info', icon: User },
    { id: 2, name: 'Education', icon: GraduationCap },
    { id: 3, name: 'Skills', icon: Code },
    { id: 4, name: 'Experience', icon: Briefcase },
    { id: 5, name: 'Projects', icon: Award },
    { id: 6, name: 'Achievements', icon: Award },
    { id: 7, name: 'Custom', icon: PlusCircle },
];

export default function CreatePage() {
    const router = useRouter();
    const { setOriginalResume, setOriginalScore, setCurrentStep } = useResumeStore();

    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [formData, setFormData] = useState<Partial<ResumeData>>({
        personalInfo: {
            fullName: '',
            email: '',
            phone: '',
            location: '',
            linkedin: '',
            website: '',
            github: '',
        },
        education: [],
        skills: [],
        experience: [],
        projects: [],
        certifications: [],
        customSection: {
            title: 'Additional Info',
            items: ['']
        }
    });

    const handleNext = async () => {
        if (currentStepIndex < steps.length - 1) {
            setCurrentStepIndex(currentStepIndex + 1);
        } else {
            // Final step - calculate ATS score and proceed
            try {
                setOriginalResume(formData as ResumeData);

                const scoreResponse = await fetch('/api/ats-score', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ resumeData: formData }),
                });

                if (scoreResponse.ok) {
                    const { score } = await scoreResponse.json();
                    setOriginalScore(score);
                }

                setCurrentStep('enhance');
                router.push('/enhance');
            } catch (error) {
                console.error('Error:', error);
            }
        }
    };

    const handleBack = () => {
        if (currentStepIndex > 0) {
            setCurrentStepIndex(currentStepIndex - 1);
        }
    };

    const updatePersonalInfo = (field: keyof PersonalInfo, value: string) => {
        setFormData({
            ...formData,
            personalInfo: {
                ...formData.personalInfo!,
                [field]: value,
            },
        });
    };

    const addEducation = () => {
        const newEdu: Education = {
            id: `edu-${Date.now()}`,
            institution: '',
            degree: '',
            field: '',
            startDate: '',
            endDate: '',
            gpa: '',
            achievements: [],
        };
        setFormData({
            ...formData,
            education: [...(formData.education || []), newEdu],
        });
    };

    // Custom Section Handlers
    const addCustomItem = () => {
        setFormData({
            ...formData,
            customSection: {
                ...formData.customSection!,
                items: [...(formData.customSection?.items || []), '']
            }
        });
    };

    const updateCustomItem = (index: number, value: string) => {
        const newItems = [...(formData.customSection?.items || [])];
        newItems[index] = value;
        setFormData({
            ...formData,
            customSection: {
                ...formData.customSection!,
                items: newItems
            }
        });
    };

    const deleteCustomItem = (index: number) => {
        const newItems = [...(formData.customSection?.items || [])];
        newItems.splice(index, 1);
        setFormData({
            ...formData,
            customSection: {
                ...formData.customSection!,
                items: newItems
            }
        });
    };

    const updateEducation = (index: number, field: keyof Education, value: any) => {
        const updated = [...(formData.education || [])];
        updated[index] = { ...updated[index], [field]: value };
        setFormData({ ...formData, education: updated });
    };

    const addExperience = () => {
        const newExp: Experience = {
            id: `exp-${Date.now()}`,
            company: '',
            position: '',
            location: '',
            startDate: '',
            endDate: '',
            current: false,
            responsibilities: [],
            achievements: [],
        };
        setFormData({
            ...formData,
            experience: [...(formData.experience || []), newExp],
        });
    };

    const updateExperience = (index: number, field: keyof Experience, value: any) => {
        const updated = [...(formData.experience || [])];
        updated[index] = { ...updated[index], [field]: value };
        setFormData({ ...formData, experience: updated });
    };

    const addProject = () => {
        const newProj: Project = {
            id: `proj-${Date.now()}`,
            title: '',
            description: '',
            technologies: [],
            link: '',
            github: '',
            highlights: [],
        };
        setFormData({
            ...formData,
            projects: [...(formData.projects || []), newProj],
        });
    };

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                updatePersonalInfo('photoUrl', reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const updateProject = (index: number, field: keyof Project, value: any) => {
        const updated = [...(formData.projects || [])];
        updated[index] = { ...updated[index], [field]: value };
        setFormData({ ...formData, projects: updated });
    };

    const addSkillCategory = () => {
        const newSkill: Skill = {
            category: '',
            items: [],
        };
        setFormData({
            ...formData,
            skills: [...(formData.skills || []), newSkill],
        });
    };

    const updateSkill = (index: number, field: keyof Skill, value: any) => {
        const updated = [...(formData.skills || [])];
        updated[index] = { ...updated[index], [field]: value };
        setFormData({ ...formData, skills: updated });
    };

    const addCertification = () => {
        const newCert: Certification = {
            id: `cert-${Date.now()}`,
            name: '',
            issuer: '',
            date: '',
            credentialId: '',
        };
        setFormData({
            ...formData,
            certifications: [...(formData.certifications || []), newCert],
        });
    };

    const updateCertification = (index: number, field: keyof Certification, value: any) => {
        const updated = [...(formData.certifications || [])];
        updated[index] = { ...updated[index], [field]: value };
        setFormData({ ...formData, certifications: updated });
    };

    return (
        <div className="min-h-screen relative" style={{ background: '#1e3a8a', minHeight: '100vh' }}>
            {/* Main Container */}
            <div className="flex h-screen">
                {/* Left Side - Form */}
                <div className="flex-1 overflow-y-auto">
                    <div className="p-8">
                        {/* Header */}
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 text-white/90 hover:text-white transition-colors mb-8"
                            style={{ color: 'rgba(255,255,255,0.9)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Back to Home
                        </Link>

                        <div className="mb-8">
                            <h1 className="text-4xl font-bold text-cyan-400 mb-2" style={{ fontSize: '2.25rem', fontWeight: 'bold', color: '#22d3ee', marginBottom: '0.5rem' }}>
                                Create Your Resume
                            </h1>
                            <p className="text-white/80" style={{ color: 'rgba(255,255,255,0.8)' }}>
                                Fill in your details to create an ATS-optimized resume from scratch
                            </p>
                        </div>

                        {/* Progress Steps */}
                        <div className="mb-8 bg-white/10 backdrop-blur-md rounded-2xl p-4">
                            <div className="flex items-center justify-between">
                                {steps.map((step, index) => {
                                    const Icon = step.icon;
                                    const isCompleted = index < currentStepIndex;
                                    const isCurrent = index === currentStepIndex;

                                    return (
                                        <div key={step.id} className="flex items-center flex-1">
                                            <div className="flex flex-col items-center flex-1">
                                                <div
                                                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${isCompleted
                                                        ? 'bg-white text-purple-600'
                                                        : isCurrent
                                                            ? 'bg-blue-500 text-white'
                                                            : 'bg-white/20 text-white/60'
                                                        }`}
                                                >
                                                    {isCompleted ? (
                                                        <Check className="w-6 h-6" />
                                                    ) : (
                                                        <Icon className="w-6 h-6" />
                                                    )}
                                                </div>
                                                <span className={`mt-2 text-sm text-center ${isCurrent ? 'text-white font-semibold' : 'text-white/70'}`}>
                                                    {step.name}
                                                </span>
                                            </div>
                                            {index < steps.length - 1 && (
                                                <div
                                                    className={`h-1 flex-1 mx-2 rounded transition-all duration-300 ${isCompleted ? 'bg-white' : 'bg-white/20'
                                                        }`}
                                                />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Form Content */}
                        <div className="max-w-4xl mx-auto">
                            <div className="bg-gradient-to-br from-slate-800/90 to-purple-900/50 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-8 shadow-2xl shadow-purple-500/10">
                                <AnimatePresence mode="wait">
                                    {/* Step 1: Personal Info */}
                                    {currentStepIndex === 0 && (
                                        <motion.div
                                            key="personal"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="space-y-6"
                                        >
                                            <h2 className="text-2xl font-semibold text-white mb-6">Personal Information</h2>

                                            {/* Profile Picture Upload */}
                                            <div className="flex flex-col items-center mb-8">
                                                <div className="relative group">
                                                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-blue-500/30 shadow-xl bg-slate-800 flex items-center justify-center">
                                                        {formData.personalInfo?.photoUrl ? (
                                                            <img
                                                                src={formData.personalInfo.photoUrl}
                                                                alt="Profile"
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <span className="text-3xl font-bold text-blue-400">
                                                                {(formData.personalInfo?.fullName || 'User').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                                                            </span>
                                                        )}

                                                        <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full">
                                                            <span className="text-white text-xs font-medium">Change</span>
                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                onChange={handlePhotoUpload}
                                                                className="hidden"
                                                            />
                                                        </label>
                                                    </div>
                                                </div>
                                                <p className="text-slate-400 text-xs mt-2">Click to upload photo</p>
                                            </div>

                                            <div className="grid md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                                        Full Name
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={formData.personalInfo?.fullName || ''}
                                                        onChange={(e) => updatePersonalInfo('fullName', e.target.value)}
                                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                                        Email
                                                    </label>
                                                    <input
                                                        type="email"
                                                        value={formData.personalInfo?.email || ''}
                                                        onChange={(e) => updatePersonalInfo('email', e.target.value)}
                                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                                        Phone
                                                    </label>
                                                    <div className="flex gap-2">
                                                        <select
                                                            className="px-4 py-3 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                            defaultValue="+1"
                                                            style={{ width: '120px', background: 'transparent' }}
                                                        >
                                                            <option value="+93">🇦🇫 +93</option>
                                                            <option value="+355">🇦🇱 +355</option>
                                                            <option value="+213">🇩🇿 +213</option>
                                                            <option value="+376">🇦🇩 +376</option>
                                                            <option value="+244">🇦🇴 +244</option>
                                                            <option value="+54">🇦🇷 +54</option>
                                                            <option value="+374">🇦🇲 +374</option>
                                                            <option value="+61">��🇺 +61</option>
                                                            <option value="+43">🇦🇹 +43</option>
                                                            <option value="+994">🇦� +994</option>
                                                            <option value="+973">🇧🇭 +973</option>
                                                            <option value="+880">🇧🇩 +880</option>
                                                            <option value="+375">🇧🇾 +375</option>
                                                            <option value="+32">🇧🇪 +32</option>
                                                            <option value="+501">🇧🇿 +501</option>
                                                            <option value="+55">🇧🇷 +55</option>
                                                            <option value="+359">🇧🇬 +359</option>
                                                            <option value="+855">🇰🇭 +855</option>
                                                            <option value="+1">🇨🇦 +1</option>
                                                            <option value="+56">🇨🇱 +56</option>
                                                            <option value="+86">🇨🇳 +86</option>
                                                            <option value="+57">🇨🇴 +57</option>
                                                            <option value="+506">🇨🇷 +506</option>
                                                            <option value="+385">🇭🇷 +385</option>
                                                            <option value="+53">🇨🇺 +53</option>
                                                            <option value="+357">🇨🇾 +357</option>
                                                            <option value="+420">🇨🇿 +420</option>
                                                            <option value="+45">�🇰 +45</option>
                                                            <option value="+20">🇪�🇬 +20</option>
                                                            <option value="+372">🇪� +372</option>
                                                            <option value="+358">🇫🇮 +358</option>
                                                            <option value="+33">🇫🇷 +33</option>
                                                            <option value="+995">🇬🇪 +995</option>
                                                            <option value="+49">🇩🇪 +49</option>
                                                            <option value="+30">🇬🇷 +30</option>
                                                            <option value="+852">🇭🇰 +852</option>
                                                            <option value="+36">🇭🇺 +36</option>
                                                            <option value="+354">🇮🇸 +354</option>
                                                            <option value="+91">🇮🇳 +91</option>
                                                            <option value="+62">🇮🇩 +62</option>
                                                            <option value="+98">🇮🇷 +98</option>
                                                            <option value="+964">�� +964</option>
                                                            <option value="+353">🇮🇪 +353</option>
                                                            <option value="+972">🇮🇱 +972</option>
                                                            <option value="+39">🇮🇹 +39</option>
                                                            <option value="+81">🇯🇵 +81</option>
                                                            <option value="+962">🇯🇴 +962</option>
                                                            <option value="+7">🇰🇿 +7</option>
                                                            <option value="+254">�🇪 +254</option>
                                                            <option value="+965">🇰🇼 +965</option>
                                                            <option value="+371">🇱🇻 +371</option>
                                                            <option value="+961">🇱🇧 +961</option>
                                                            <option value="+370">�� +370</option>
                                                            <option value="+352">🇱🇺 +352</option>
                                                            <option value="+60">🇲🇾 +60</option>
                                                            <option value="+960">🇲🇻 +960</option>
                                                            <option value="+356">🇲🇹 +356</option>
                                                            <option value="+52">🇲🇽 +52</option>
                                                            <option value="+212">��🇦 +212</option>
                                                            <option value="+31">🇳🇱 +31</option>
                                                            <option value="+64">🇳🇿 +64</option>
                                                            <option value="+234">🇳🇬 +234</option>
                                                            <option value="+47">🇳🇴 +47</option>
                                                            <option value="+968">🇴🇲 +968</option>
                                                            <option value="+92">🇵🇰 +92</option>
                                                            <option value="+507">🇵🇦 +507</option>
                                                            <option value="+51">�🇪 +51</option>
                                                            <option value="+63">🇵🇭 +63</option>
                                                            <option value="+48">🇵🇱 +48</option>
                                                            <option value="+351">🇵🇹 +351</option>
                                                            <option value="+974">🇶🇦 +974</option>
                                                            <option value="+40">🇷🇴 +40</option>
                                                            <option value="+7">🇷🇺 +7</option>
                                                            <option value="+966">�� +966</option>
                                                            <option value="+381">�🇷🇸 +381</option>
                                                            <option value="+65">🇸🇬 +65</option>
                                                            <option value="+421">🇸🇰 +421</option>
                                                            <option value="+386">🇸🇮 +386</option>
                                                            <option value="+27">🇿🇦 +27</option>
                                                            <option value="+82">🇰🇷 +82</option>
                                                            <option value="+34">🇪🇸 +34</option>
                                                            <option value="+94">�� +94</option>
                                                            <option value="+46">🇸🇪 +46</option>
                                                            <option value="+41">�� +41</option>
                                                            <option value="+886">�� +886</option>
                                                            <option value="+66">🇹🇭 +66</option>
                                                            <option value="+90">🇹🇷 +90</option>
                                                            <option value="+380">🇺🇦 +380</option>
                                                            <option value="+971">🇦🇪 +971</option>
                                                            <option value="+44">🇬🇧 +44</option>
                                                            <option value="+1">🇺🇸 +1</option>
                                                            <option value="+598">🇺🇾 +598</option>
                                                            <option value="+998">🇺🇿 +998</option>
                                                            <option value="+58">🇻🇪 +58</option>
                                                            <option value="+84">🇻🇳 +84</option>
                                                        </select>
                                                        <input
                                                            type="tel"
                                                            value={formData.personalInfo?.phone || ''}
                                                            onChange={(e) => updatePersonalInfo('phone', e.target.value.replace(/[^0-9]/g, ''))}
                                                            className="flex-1 px-4 py-3 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                            style={{ background: 'transparent' }}
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                                        Location
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={formData.personalInfo?.location || ''}
                                                        onChange={(e) => updatePersonalInfo('location', e.target.value)}
                                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                                        LinkedIn
                                                    </label>
                                                    <input
                                                        type="url"
                                                        value={formData.personalInfo?.linkedin || ''}
                                                        onChange={(e) => updatePersonalInfo('linkedin', e.target.value)}
                                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                                        GitHub
                                                    </label>
                                                    <input
                                                        type="url"
                                                        value={formData.personalInfo?.github || ''}
                                                        onChange={(e) => updatePersonalInfo('github', e.target.value)}
                                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Step 2: Education */}
                                    {currentStepIndex === 1 && (
                                        <motion.div
                                            key="education"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="space-y-6"
                                        >
                                            <div className="flex justify-between items-center mb-6">
                                                <h2 className="text-2xl font-semibold text-white">Education</h2>
                                                <button
                                                    onClick={addEducation}
                                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300"
                                                >
                                                    + Add Education
                                                </button>
                                            </div>

                                            {formData.education?.map((edu, index) => (
                                                <div key={edu.id} className="p-6 bg-white/5 border border-white/10 rounded-lg space-y-4">
                                                    <div className="flex justify-between items-center mb-4">
                                                        <h3 className="text-sm text-white">Education {index + 1}</h3>
                                                        <button
                                                            onClick={() => {
                                                                const newEducation = (formData.education || []).filter((_, i) => i !== index);
                                                                setFormData({ ...formData, education: newEducation });
                                                            }}
                                                            className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-white border border-white/20 rounded-lg hover:bg-white/10 transition-all duration-200"
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                    <div className="grid md:grid-cols-2 gap-4">
                                                        <input
                                                            type="text"
                                                            value={edu.institution}
                                                            onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                                                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                            placeholder="Institution"
                                                        />
                                                        <input
                                                            type="text"
                                                            value={edu.degree}
                                                            onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                                                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                            placeholder="Degree (e.g., Bachelor of Science)"
                                                        />
                                                        <input
                                                            type="text"
                                                            value={edu.field}
                                                            onChange={(e) => updateEducation(index, 'field', e.target.value)}
                                                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                            placeholder="Field of Study"
                                                        />
                                                        <input
                                                            type="text"
                                                            value={edu.gpa || ''}
                                                            onChange={(e) => updateEducation(index, 'gpa', e.target.value)}
                                                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                            placeholder="GPA (optional)"
                                                        />
                                                        <input
                                                            type="text"
                                                            value={edu.startDate}
                                                            onChange={(e) => updateEducation(index, 'startDate', e.target.value)}
                                                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                            placeholder="Start Date (e.g., 2018)"
                                                        />
                                                        <input
                                                            type="text"
                                                            value={edu.endDate}
                                                            onChange={(e) => updateEducation(index, 'endDate', e.target.value)}
                                                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                            placeholder="End Date (e.g., 2022)"
                                                        />
                                                    </div>
                                                </div>
                                            ))}

                                            {formData.education?.length === 0 && (
                                                <p className="text-center text-gray-400 py-8">
                                                    No education entries yet. Click "Add Education" to get started.
                                                </p>
                                            )}
                                        </motion.div>
                                    )}

                                    {/* Step 3: Skills */}
                                    {currentStepIndex === 2 && (
                                        <motion.div
                                            key="skills"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="space-y-6"
                                        >
                                            <div className="flex justify-between items-center mb-6">
                                                <h2 className="text-2xl font-semibold text-white">Skills</h2>
                                                <button
                                                    onClick={addSkillCategory}
                                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300"
                                                >
                                                    + Add Skill Category
                                                </button>
                                            </div>

                                            {formData.skills?.map((skill, index) => (
                                                <div key={index} className="p-6 bg-white/5 border border-white/10 rounded-lg space-y-4">
                                                    <input
                                                        type="text"
                                                        value={skill.category}
                                                        onChange={(e) => updateSkill(index, 'category', e.target.value)}
                                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        placeholder="Category (e.g., Programming Languages, Tools)"
                                                    />
                                                    <textarea
                                                        value={skill.items.join(', ')}
                                                        onChange={(e) => updateSkill(index, 'items', e.target.value.split(',').map(s => s.trim()))}
                                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        placeholder="Skills (comma-separated, e.g., JavaScript, Python, React)"
                                                        rows={3}
                                                    />
                                                </div>
                                            ))}

                                            {formData.skills?.length === 0 && (
                                                <p className="text-center text-gray-400 py-8">
                                                    No skills added yet. Click "Add Skill Category" to get started.
                                                </p>
                                            )}
                                        </motion.div>
                                    )}

                                    {/* Step 4: Experience */}
                                    {currentStepIndex === 3 && (
                                        <motion.div
                                            key="experience"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="space-y-6"
                                        >
                                            <div className="flex justify-between items-center mb-6">
                                                <h2 className="text-2xl font-semibold text-white">Work Experience</h2>
                                                <button
                                                    onClick={addExperience}
                                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300"
                                                >
                                                    + Add Experience
                                                </button>
                                            </div>

                                            {formData.experience?.map((exp, index) => (
                                                <div key={exp.id} className="p-6 bg-white/5 border border-white/10 rounded-lg space-y-4">
                                                    <div className="flex justify-between items-center mb-4">
                                                        <h3 className="text-sm text-white">Experience {index + 1}</h3>
                                                        <button
                                                            onClick={() => {
                                                                const newExperience = (formData.experience || []).filter((_, i) => i !== index);
                                                                setFormData({ ...formData, experience: newExperience });
                                                            }}
                                                            className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-white border border-white/20 rounded-lg hover:bg-white/10 transition-all duration-200"
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                    <div className="grid md:grid-cols-2 gap-4">
                                                        <input
                                                            type="text"
                                                            value={exp.company}
                                                            onChange={(e) => updateExperience(index, 'company', e.target.value)}
                                                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                            placeholder="Company"
                                                        />
                                                        <input
                                                            type="text"
                                                            value={exp.position}
                                                            onChange={(e) => updateExperience(index, 'position', e.target.value)}
                                                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                            placeholder="Position"
                                                        />
                                                        <input
                                                            type="text"
                                                            value={exp.location}
                                                            onChange={(e) => updateExperience(index, 'location', e.target.value)}
                                                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                            placeholder="Location"
                                                        />
                                                        <input
                                                            type="text"
                                                            value={exp.startDate}
                                                            onChange={(e) => updateExperience(index, 'startDate', e.target.value)}
                                                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                            placeholder="Start Date"
                                                        />
                                                        <input
                                                            type="text"
                                                            value={exp.endDate}
                                                            onChange={(e) => updateExperience(index, 'endDate', e.target.value)}
                                                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                            placeholder="End Date"
                                                            disabled={exp.current}
                                                        />
                                                    </div>
                                                    <label className="flex items-center gap-2 text-gray-300">
                                                        <input
                                                            type="checkbox"
                                                            checked={exp.current}
                                                            onChange={(e) => updateExperience(index, 'current', e.target.checked)}
                                                            className="w-4 h-4"
                                                        />
                                                        Currently working here
                                                    </label>
                                                    <textarea
                                                        value={exp.responsibilities.join('\n')}
                                                        onChange={(e) => updateExperience(index, 'responsibilities', e.target.value.split('\n').filter(s => s.trim()))}
                                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        placeholder="Responsibilities (one per line)"
                                                        rows={4}
                                                    />
                                                </div>
                                            ))}

                                            {formData.experience?.length === 0 && (
                                                <p className="text-center text-gray-400 py-8">
                                                    No experience added yet. Click "Add Experience" to get started.
                                                </p>
                                            )}
                                        </motion.div>
                                    )}

                                    {/* Step 5: Projects */}
                                    {currentStepIndex === 4 && (
                                        <motion.div
                                            key="projects"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="space-y-6"
                                        >
                                            <div className="flex justify-between items-center mb-6">
                                                <h2 className="text-2xl font-semibold text-white">Projects</h2>
                                                <button
                                                    onClick={addProject}
                                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300"
                                                >
                                                    + Add Project
                                                </button>
                                            </div>

                                            {formData.projects?.map((project, index) => (
                                                <div key={project.id} className="p-6 bg-white/5 border border-white/10 rounded-lg space-y-4">
                                                    <div className="flex justify-between items-center mb-4">
                                                        <h3 className="text-sm text-white">Project {index + 1}</h3>
                                                        <button
                                                            onClick={() => {
                                                                const newProjects = (formData.projects || []).filter((_, i) => i !== index);
                                                                setFormData({ ...formData, projects: newProjects });
                                                            }}
                                                            className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-white border border-white/20 rounded-lg hover:bg-white/10 transition-all duration-200"
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                    <input
                                                        type="text"
                                                        value={project.title}
                                                        onChange={(e) => updateProject(index, 'title', e.target.value)}
                                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        placeholder="Project Title"
                                                    />
                                                    <textarea
                                                        value={project.description}
                                                        onChange={(e) => updateProject(index, 'description', e.target.value)}
                                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        placeholder="Project Description"
                                                        rows={3}
                                                    />
                                                    <input
                                                        type="text"
                                                        value={project.technologies.join(', ')}
                                                        onChange={(e) => updateProject(index, 'technologies', e.target.value.split(',').map(s => s.trim()))}
                                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        placeholder="Technologies (comma-separated)"
                                                    />
                                                    <div className="grid md:grid-cols-2 gap-4">
                                                        <input
                                                            type="url"
                                                            value={project.link || ''}
                                                            onChange={(e) => updateProject(index, 'link', e.target.value)}
                                                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                            placeholder="Project Link (optional)"
                                                        />
                                                        <input
                                                            type="url"
                                                            value={project.github || ''}
                                                            onChange={(e) => updateProject(index, 'github', e.target.value)}
                                                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                            placeholder="GitHub Link (optional)"
                                                        />
                                                    </div>
                                                </div>
                                            ))}

                                            {formData.projects?.length === 0 && (
                                                <p className="text-center text-gray-400 py-8">
                                                    No projects added yet. Click "Add Project" to get started.
                                                </p>
                                            )}
                                        </motion.div>
                                    )}

                                    {/* Step 6: Achievements/Certifications */}
                                    {currentStepIndex === 5 && (
                                        <motion.div
                                            key="achievements"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="space-y-6"
                                        >
                                            <div className="flex justify-between items-center mb-6">
                                                <h2 className="text-2xl font-semibold text-white">Achievements & Certifications</h2>
                                                <button
                                                    onClick={addCertification}
                                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300"
                                                >
                                                    + Add Certification
                                                </button>
                                            </div>

                                            {formData.certifications?.map((cert, index) => (
                                                <div key={cert.id} className="p-6 bg-white/5 border border-white/10 rounded-lg space-y-4">
                                                    <div className="flex justify-between items-center mb-4">
                                                        <h3 className="text-sm text-white">Achievement {index + 1}</h3>
                                                        <button
                                                            onClick={() => {
                                                                const newCertifications = (formData.certifications || []).filter((_, i) => i !== index);
                                                                setFormData({ ...formData, certifications: newCertifications });
                                                            }}
                                                            className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-white border border-white/20 rounded-lg hover:bg-white/10 transition-all duration-200"
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                    <input
                                                        type="text"
                                                        value={cert.name}
                                                        onChange={(e) => updateCertification(index, 'name', e.target.value)}
                                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        placeholder="Certification/Achievement Name"
                                                    />
                                                    <div className="grid md:grid-cols-2 gap-4">
                                                        <input
                                                            type="text"
                                                            value={cert.issuer}
                                                            onChange={(e) => updateCertification(index, 'issuer', e.target.value)}
                                                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                            placeholder="Issuing Organization"
                                                        />
                                                        <input
                                                            type="text"
                                                            value={cert.date}
                                                            onChange={(e) => updateCertification(index, 'date', e.target.value)}
                                                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                            placeholder="Date Obtained (e.g., Jan 2024)"
                                                        />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        value={cert.credentialId || ''}
                                                        onChange={(e) => updateCertification(index, 'credentialId', e.target.value)}
                                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        placeholder="Credential ID (optional)"
                                                    />
                                                </div>
                                            ))}

                                            {formData.certifications?.length === 0 && (
                                                <p className="text-center text-gray-400 py-8">
                                                    No certifications added yet. Click "Add Certification" to get started.
                                                </p>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Navigation Buttons */}
                                <div className="flex justify-between mt-8 pt-6 border-t border-white/10">
                                    <button
                                        onClick={handleBack}
                                        disabled={currentStepIndex === 0}
                                        className="px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        <ArrowLeft className="w-5 h-5" />
                                        Back
                                    </button>

                                    <button
                                        onClick={handleNext}
                                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2"
                                    >
                                        {currentStepIndex === steps.length - 1 ? 'Finish' : 'Next'}
                                        <ArrowRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
