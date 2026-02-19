import { FOUNDATION_NAME, CONTACT_PHONE, CONTACT_EMAIL } from '@/lib/constants';

export default function Footer() {
  return (
    <footer className="bg-ss-navy text-white/70 text-xs py-4 px-6 mt-auto">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <p>
          © {new Date().getFullYear()} {FOUNDATION_NAME}. All rights reserved.
        </p>
        <div className="flex items-center gap-4">
          <a href={`tel:${CONTACT_PHONE}`} className="hover:text-white transition-colors">
            {CONTACT_PHONE}
          </a>
          <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-white transition-colors">
            {CONTACT_EMAIL}
          </a>
        </div>
      </div>
    </footer>
  );
}
