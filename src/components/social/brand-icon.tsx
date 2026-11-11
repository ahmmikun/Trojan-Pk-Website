import { Globe, Mail, type LucideProps } from "lucide-react";
import type { IconType } from "react-icons";
import {
  FaDiscord,
  FaFacebookF,
  FaGithub,
  FaInstagram,
  FaLinkedinIn,
  FaTelegram,
  FaTiktok,
  FaWhatsapp,
  FaXTwitter,
  FaYoutube,
} from "react-icons/fa6";
import type { SocialPlatform } from "@/types/social";

const brandIcons: Partial<Record<SocialPlatform, IconType>> = {
  whatsapp: FaWhatsapp,
  discord: FaDiscord,
  telegram: FaTelegram,
  instagram: FaInstagram,
  linkedin: FaLinkedinIn,
  github: FaGithub,
  facebook: FaFacebookF,
  youtube: FaYoutube,
  x: FaXTwitter,
  tiktok: FaTiktok,
};

type BrandIconProps = { icon: SocialPlatform; className?: string } & Omit<LucideProps, "ref">;

/** Brand icon for a platform; falls back to Lucide for email/website. */
export function BrandIcon({ icon, className, ...rest }: BrandIconProps) {
  if (icon === "email") return <Mail className={className} aria-hidden="true" {...rest} />;
  if (icon === "website") return <Globe className={className} aria-hidden="true" {...rest} />;
  const Icon = brandIcons[icon];
  if (!Icon) return <Globe className={className} aria-hidden="true" {...rest} />;
  return <Icon className={className} aria-hidden="true" />;
}
