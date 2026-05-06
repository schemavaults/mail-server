"use client";

import {
  BookTemplate,
  Home,
  KeyRound,
  LayoutDashboard,
  Send,
  ShieldAlert,
  type LucideIcon,
} from "lucide-react";

export interface AdminLink {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const ADMIN_LINKS: readonly AdminLink[] = [
  {
    href: "/",
    label: "View public homepage",
    icon: Home,
  },
  {
    href: "/admin",
    label: "View admin dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/admin/all_mailing_lists",
    label: "View all mailing lists (including non-public)",
    icon: ShieldAlert,
  },
  {
    href: "/admin/templates",
    label: "View mail templates",
    icon: BookTemplate,
  },
  {
    href: "/admin/send-email",
    label: "Send an email",
    icon: Send,
  },
  {
    href: "/admin/keys",
    label: "Manage API keys",
    icon: KeyRound,
  },
];

export default ADMIN_LINKS;
