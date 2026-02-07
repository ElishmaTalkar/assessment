import { Task } from '@/lib/types';

interface ProjectTimelineProps {
    tasks: Task[];
}

export default function ProjectTimeline({ tasks }: ProjectTimelineProps) {
    const categories = ['Planning', 'Design', 'Development', 'Testing', 'Marketing', 'Others'];

    const getCategoryStats = (category: string) => {
        const categoryTasks = tasks.filter(t => t.category === category);
        const total = categoryTasks.length;
        const completed = categoryTasks.filter(t => t.status === 'completed').length;
        // If no tasks, we can either show 0 or just a default small fill for aesthetics? 
        // Let's stick to real data but ensure at least some visibility if progress is low.
        const progress = total === 0 ? 0 : Math.round((completed / total) * 100);
        return { total, completed, progress };
    };

    return (
        <div className="bg-[#1a2642] border border-slate-700/20 rounded-lg p-6 mb-8 hover:border-slate-600/40 transition">
            <div className="flex flex-col gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">📊</span>
                        <h3 className="font-bold text-white text-lg">Project Timeline</h3>
                    </div>
                    <p className="text-slate-400 text-sm">Visualize your project progress</p>
                </div>

                <div className="flex gap-4 mt-2 overflow-x-auto pb-2">
                    {categories.map((category) => {
                        const { progress } = getCategoryStats(category);

                        return (
                            <div key={category} className="relative min-w-[140px] h-[60px] rounded-xl overflow-hidden shadow-lg group bg-[#2563eb]">
                                {/* Background Base (Solid Blue) */}
                                <div className="absolute inset-0 bg-[#2563eb]"></div>

                                {/* Progress Fill - Lighter/Darker Blue overlay? 
                                    The reference shows solid blue blocks. 
                                    If we want them to be "progress bars", maybe the background is dark blue and the fill is bright blue?
                                    Or maybe the pill IS the progress?
                                    Let's try: Darker Blue background, Bright Blue Fill.
                                */}
                                <div className="absolute inset-0 bg-black/20"></div>
                                <div
                                    className="absolute inset-y-0 left-0 bg-blue-500 transition-all duration-1000 ease-out"
                                    style={{ width: `${progress}%` }}
                                ></div>

                                <div className="relative z-10 flex items-center justify-center h-full w-full px-4">
                                    <h4 className="font-bold text-white text-lg tracking-wide drop-shadow-md">{category}</h4>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
