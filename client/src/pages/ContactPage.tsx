import { HiEnvelope, HiPhone, HiMapPin, HiAcademicCap, HiQuestionMarkCircle } from 'react-icons/hi2';

const FAQ_ITEMS = [
    {
        question: 'What are the U-Laundry service hours?',
        answer:
            'We operate from 9:00 AM to 8:00 PM, Monday–Saturday. You can place orders anytime, but pickups and processing happen during these hours.',
    },
    {
        question: 'How can I check the status of my laundry?',
        answer:
            'Go to your dashboard and open the order history section. Each order shows a live status like Payment left, Order Placed, Pending, Prepared, Picked Up, or Cancelled.',
    },
    {
        question: 'Where is the laundry collection point located?',
        answer:
            'Your college laundry collection point is usually near the hostel service area. Check the notice board / hostel group for the exact room number used on your campus.',
    },
    {
        question: 'Can I change or cancel my order?',
        answer:
            'You can cancel your order as long as it has not been picked up yet. Open your order history, find the order, and use the Cancel option if it is still available.',
    },
    {
        question: 'What happens if I miss my pickup?',
        answer:
            'If you miss a pickup, the moderator may try to contact you or reschedule within the available slots. In some cases you might need to place a new order, depending on your hostel rules.',
    },
    {
        question: 'How do I get help if something is wrong with my order?',
        answer:
            'If any item is missing or damaged, please contact your hostel laundry moderator or the college laundry coordinator as soon as possible with your order ID.',
    },
];

export default function ContactPage() {
    return (
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12 space-y-10 animate-fade-in">
            {/* Header */}
            <section className="rounded-[2.5rem] bg-gradient-to-br from-primary via-secondary to-primary shadow-2xl relative overflow-hidden px-6 sm:px-10 py-10 sm:py-12">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4" />

                <div className="relative z-10 space-y-4 max-w-2xl">
                    <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-white/80 bg-white/10 px-3 py-1 rounded-full backdrop-blur">
                        <HiQuestionMarkCircle className="w-4 h-4" />
                        Help & Support
                    </p>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
                        Contact & Support
                    </h1>
                    <p className="text-white/80 text-sm sm:text-base md:text-lg font-medium max-w-xl">
                        Have questions about your laundry, payments, or timings? Check our FAQs below or reach out
                        to the campus team using the details provided here.
                    </p>
                </div>
            </section>

            {/* Contact Info (no forms) */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                <div className="bg-surface rounded-3xl shadow-lg border border-accent/20 p-6 flex flex-col gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-1">
                        <HiEnvelope className="w-5 h-5" />
                    </div>
                    <h2 className="text-lg font-bold text-text">Email Support</h2>
                    <p className="text-sm text-muted">
                        For non-urgent queries and feedback, email the laundry coordination team:
                    </p>
                    <p className="text-sm font-semibold text-primary break-all">
                        ulaundry.support@college.edu
                    </p>
                    <p className="text-[11px] text-muted mt-1">
                        Response time is usually within one working day during college hours.
                    </p>
                </div>

                <div className="bg-surface rounded-3xl shadow-lg border border-accent/20 p-6 flex flex-col gap-3">
                    <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center mb-1">
                        <HiPhone className="w-5 h-5" />
                    </div>
                    <h2 className="text-lg font-bold text-text">Moderator / Helpdesk</h2>
                    <p className="text-sm text-muted">
                        For order status or urgent issues, contact your hostel laundry moderator or helpdesk during
                        working hours:
                    </p>
                    <p className="text-sm font-semibold text-text">
                        +91-98765-00000 <span className="text-muted text-xs">(sample contact)</span>
                    </p>
                    <p className="text-[11px] text-muted mt-1">
                        Actual phone numbers may be shared by your hostel or admin based on campus policy.
                    </p>
                </div>

                <div className="bg-surface rounded-3xl shadow-lg border border-accent/20 p-6 flex flex-col gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-1">
                        <HiMapPin className="w-5 h-5" />
                    </div>
                    <h2 className="text-lg font-bold text-text">On-Campus Location</h2>
                    <p className="text-sm text-muted">
                        Laundry drop-off / pickup is typically near the hostel service block or maintenance office.
                    </p>
                    <p className="text-sm font-semibold text-text">
                        U-Laundry Desk, Hostel Services Block, Your College Campus
                    </p>
                    <p className="text-[11px] text-muted mt-1">
                        Exact room and timings may vary per hostel—check notices or ask your warden/moderator.
                    </p>
                </div>
            </section>

            {/* FAQs */}
            <section className="bg-surface rounded-[2.5rem] shadow-xl border border-accent/20 overflow-hidden mb-6">
                <div className="px-6 sm:px-8 py-6 border-b border-accent/20 bg-bg/50 flex items-center gap-3">
                    <div className="w-2 h-6 rounded-full bg-primary/80" />
                    <div>
                        <h2 className="text-2xl font-bold text-text">Frequently Asked Questions</h2>
                        <p className="text-sm text-muted mt-1">
                            Quick answers to the most common questions about U-Laundry.
                        </p>
                    </div>
                </div>

                <div className="p-6 sm:p-8 space-y-4">
                    {FAQ_ITEMS.map((item, index) => (
                        <details
                            key={index}
                            className="group bg-bg/60 rounded-2xl border border-accent/10 hover:border-primary/30 transition-colors"
                        >
                            <summary className="cursor-pointer list-none px-4 sm:px-5 py-4 sm:py-5 flex items-start gap-3 sm:gap-4">
                                <div className="mt-0.5">
                                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                                        {index + 1}
                                    </span>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-start justify-between gap-3">
                                        <h3 className="text-sm sm:text-base font-semibold text-text group-open:text-primary">
                                            {item.question}
                                        </h3>
                                        <span className="mt-0.5 text-xs font-semibold text-muted group-open:text-primary">
                                            {/** Simple + / - indicator using text so no extra icons needed */}
                                            <span className="group-open:hidden">Show</span>
                                            <span className="hidden group-open:inline">Hide</span>
                                        </span>
                                    </div>
                                </div>
                            </summary>
                            <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-0 sm:pt-0 -mt-1 text-sm text-muted leading-relaxed">
                                {item.answer}
                            </div>
                        </details>
                    ))}
                </div>
            </section>


        </div>
    );
}

