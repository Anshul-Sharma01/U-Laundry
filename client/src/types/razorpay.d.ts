/**
 * TypeScript declarations for Razorpay Checkout.js
 * Loaded globally via <script> in index.html
 */

interface RazorpayOptions {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description?: string;
    image?: string;
    order_id: string;
    prefill?: {
        name?: string;
        email?: string;
        contact?: string;
    };
    notes?: Record<string, string>;
    theme?: {
        color?: string;
    };
    handler: (response: RazorpayPaymentResponse) => void;
    modal?: {
        ondismiss?: () => void;
        escape?: boolean;
        confirm_close?: boolean;
    };
}

interface RazorpayPaymentResponse {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
}

interface RazorpayInstance {
    open(): void;
    close(): void;
    on(event: string, handler: (...args: any[]) => void): void;
}

interface RazorpayConstructor {
    new (options: RazorpayOptions): RazorpayInstance;
}

interface Window {
    Razorpay: RazorpayConstructor;
}
