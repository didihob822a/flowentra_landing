// Centralized icon registry shared between the public Navbar and the admin MegaMenuBuilder.
// Organized into categories so the IconPicker can offer tabbed browsing.
import {
  // Business & Tools
  Wrench, FolderKanban, LayoutDashboard, Briefcase, Building, Building2,
  Factory, Store, Warehouse, ShoppingCart, ShoppingBag, Package, PackageCheck,
  Truck, Forklift, Hammer, Drill, Ruler, HardHat, Cog, Settings, Settings2,
  Wallet, CreditCard, Receipt, DollarSign, Euro, BadgeDollarSign, Banknote,
  // People & Communication
  Users, User, UserCog, UserCheck, UserPlus, Contact, Phone, PhoneCall,
  Mail, MessageCircle, MessageSquare, Send, Inbox, AtSign, Megaphone, Bell,
  Headphones, HeadphonesIcon, Mic, Video, Camera,
  // Tech & Devices
  Smartphone, Tablet, Laptop, Monitor, Server, Database, HardDrive, Cpu,
  CircuitBoard, Cable, Wifi, Bluetooth, Router, Cloud, CloudUpload, CloudDownload,
  Code, Code2, Terminal, GitBranch, GitMerge, Bug, Wrench as WrenchIcon,
  // Data & Analytics
  BarChart, BarChart2, BarChart3, BarChart4, LineChart, PieChart, TrendingUp,
  TrendingDown, Activity, Gauge, Target, Crosshair, Filter, Search,
  // Files & Documents
  FileText, File, Files, FileSpreadsheet, FileCheck, FilePlus, Folder,
  FolderOpen, FolderPlus, Archive, Clipboard, ClipboardCheck, ClipboardList,
  BookOpen, Book, Library, Bookmark, Newspaper,
  // Industry / Field service
  MapPin, Map, Navigation, Compass, Globe, Globe2, Route, Car, Bike, Bus,
  Plane, Train, Anchor, Tractor, Snowflake, Sun, Moon, Cloud as CloudIcon,
  Droplet, Droplets, Flame, Wind, Thermometer, Leaf, TreePine, Flower2,
  // Security
  Shield, ShieldCheck, ShieldAlert, Lock, Unlock, Key, Eye, EyeOff,
  Fingerprint, ScanFace, KeyRound,
  // AI / Automation
  Brain, Bot, Sparkles, Wand2, Zap, Workflow, GitFork, Network, Share2,
  // UI & misc
  Layers, Layout, LayoutGrid, LayoutList, Grid3x3, List, Columns,
  Sidebar, PanelLeft, PanelRight, Maximize, Minimize,
  Play, Pause, Square, Circle, Triangle, Star, Heart, ThumbsUp, Award,
  Trophy, Crown, Gem, Gift, Flag, Tag, Tags, Hash, Percent,
  HelpCircle, Info, AlertCircle, AlertTriangle, CheckCircle, XCircle,
  Plus, Minus, X, Check, ArrowRight, ArrowUp, ArrowDown, ArrowLeft,
  Calendar, CalendarDays, Clock, Timer, Hourglass, Bell as BellIcon,
  Handshake, Lightbulb, Rocket, Anchor as AnchorIcon, Puzzle, Palette,
  Image, Images, Film, Music, Volume2, Speaker,
  // Spray / cleaning / facilities
  SprayCan, Brush, PaintBucket, Trash2, Recycle,
  // Health
  Stethoscope, HeartPulse, Pill, Syringe, Cross,
  // Commerce / Marketing
  Megaphone as MegaphoneIcon, BadgeCheck, BadgePercent, Gift as GiftIcon,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type IconMap = Record<string, LucideIcon>;

export const ICON_CATEGORIES: { id: string; label: string; icons: IconMap }[] = [
  {
    id: "business",
    label: "Business",
    icons: {
      Wrench, FolderKanban, LayoutDashboard, Briefcase, Building, Building2,
      Factory, Store, Warehouse, ShoppingCart, ShoppingBag, Package, PackageCheck,
      Truck, Forklift, Hammer, Drill, Ruler, HardHat, Cog, Settings, Settings2,
      Wallet, CreditCard, Receipt, DollarSign, Euro, BadgeDollarSign, Banknote,
    },
  },
  {
    id: "people",
    label: "People",
    icons: {
      Users, User, UserCog, UserCheck, UserPlus, Contact, Phone, PhoneCall,
      Mail, MessageCircle, MessageSquare, Send, Inbox, AtSign, Megaphone, Bell,
      Headphones, HeadphonesIcon, Mic, Video, Camera, Handshake,
    },
  },
  {
    id: "tech",
    label: "Tech",
    icons: {
      Smartphone, Tablet, Laptop, Monitor, Server, Database, HardDrive, Cpu,
      CircuitBoard, Cable, Wifi, Bluetooth, Router, Cloud, CloudUpload, CloudDownload,
      Code, Code2, Terminal, GitBranch, GitMerge, Bug,
    },
  },
  {
    id: "data",
    label: "Data",
    icons: {
      BarChart, BarChart2, BarChart3, BarChart4, LineChart, PieChart, TrendingUp,
      TrendingDown, Activity, Gauge, Target, Crosshair, Filter, Search,
    },
  },
  {
    id: "files",
    label: "Files",
    icons: {
      FileText, File, Files, FileSpreadsheet, FileCheck, FilePlus, Folder,
      FolderOpen, FolderPlus, Archive, Clipboard, ClipboardCheck, ClipboardList,
      BookOpen, Book, Library, Bookmark, Newspaper,
    },
  },
  {
    id: "field",
    label: "Field & Map",
    icons: {
      MapPin, Map, Navigation, Compass, Globe, Globe2, Route, Car, Bike, Bus,
      Plane, Train, Anchor, Tractor, Snowflake, Sun, Moon, CloudIcon,
      Droplet, Droplets, Flame, Wind, Thermometer, Leaf, TreePine, Flower2,
    },
  },
  {
    id: "security",
    label: "Security",
    icons: {
      Shield, ShieldCheck, ShieldAlert, Lock, Unlock, Key, Eye, EyeOff,
      Fingerprint, ScanFace, KeyRound,
    },
  },
  {
    id: "ai",
    label: "AI & Auto",
    icons: {
      Brain, Bot, Sparkles, Wand2, Zap, Workflow, GitFork, Network, Share2,
    },
  },
  {
    id: "ui",
    label: "UI",
    icons: {
      Layers, Layout, LayoutGrid, LayoutList, Grid3x3, List, Columns,
      Sidebar, PanelLeft, PanelRight, Maximize, Minimize,
      Play, Pause, Square, Circle, Triangle, Star, Heart, ThumbsUp, Award,
      Trophy, Crown, Gem, Gift, Flag, Tag, Tags, Hash, Percent,
      HelpCircle, Info, AlertCircle, AlertTriangle, CheckCircle, XCircle,
      Plus, Minus, X, Check, ArrowRight, ArrowUp, ArrowDown, ArrowLeft,
      Calendar, CalendarDays, Clock, Timer, Hourglass,
      Lightbulb, Rocket, Puzzle, Palette,
      Image, Images, Film, Music, Volume2, Speaker,
    },
  },
  {
    id: "facility",
    label: "Facility",
    icons: { SprayCan, Brush, PaintBucket, Trash2, Recycle },
  },
  {
    id: "health",
    label: "Health",
    icons: { Stethoscope, HeartPulse, Pill, Syringe, Cross },
  },
  {
    id: "marketing",
    label: "Marketing",
    icons: { MegaphoneIcon, BadgeCheck, BadgePercent, GiftIcon },
  },
];

// Flat registry — used by Navbar to resolve icon names from CMS strings.
export const MEGA_ICONS: IconMap = ICON_CATEGORIES.reduce<IconMap>((acc, cat) => {
  for (const [name, Icon] of Object.entries(cat.icons)) acc[name] = Icon;
  return acc;
}, {});

export const MEGA_ICON_NAMES = Object.keys(MEGA_ICONS);

export const resolveMegaIcon = (name?: string): LucideIcon =>
  (name && MEGA_ICONS[name]) || Layers;
