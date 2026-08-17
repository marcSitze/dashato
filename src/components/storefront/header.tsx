'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  Menu,
  ChevronDown,
  Store,
  SlidersHorizontal,
  LayoutDashboard,
  LogOut,
  Package,
  Sparkles,
} from 'lucide-react';
import { useCartStore } from '@/store/cart-store';
import { useWishlistStore } from '@/store/wishlist-store';
import { useUIStore } from '@/store/ui-store';
import { useTranslation } from '@/lib/i18n/context';
import { ThemeToggle } from '@/components/theme-toggle';
import { LanguageToggle } from '@/components/language-toggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  children?: { id: string; name: string; slug: string }[];
}

export function Header({ categories = [] }: { categories?: CategoryItem[] }) {
  const router = useRouter();
  const { t } = useTranslation();
  const sessionState = useSession();
  const session = sessionState?.data;
  const cartItemCount = useCartStore((state) => state.getItemCount());
  const wishlistCount = useWishlistStore((state) => state.items.length);
  const openCartDrawer = useUIStore((state) => state.openCartDrawer);

  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('all');
  const [isSearching, setIsSearching] = React.useState(false);
  const [suggestions, setSuggestions] = React.useState<any[]>([]);

  // Autocomplete debounced search
  React.useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/search/autocomplete?q=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data.suggestions || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSuggestions([]);
    router.push(`/products?q=${encodeURIComponent(searchQuery)}&category=${selectedCategory}`);
  };

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Mobile Navigation Trigger & Brand Logo */}
          <div className="flex items-center gap-3">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="w-5 h-5 text-foreground" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2 text-xl font-bold">
                    <img
                      src="/Dashato_logo_light_mode.png"
                      alt="Dashato"
                      className="h-8 w-auto dark:hidden object-contain"
                    />
                    <img
                      src="/Dashato_logo_dark_mode.png"
                      alt="Dashato"
                      className="h-8 w-auto hidden dark:block object-contain"
                    />
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-6 flex flex-col space-y-4">
                  <Link href="/products" className="font-semibold text-foreground hover:text-primary">
                    All Products
                  </Link>
                  <div className="border-t border-border pt-3">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Shop by Category</p>
                    {categories.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/products?category=${cat.slug}`}
                        className="block py-1.5 text-sm text-muted-foreground hover:text-primary"
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <Link href="/" className="flex items-center gap-2 group">
              <img
                src="/Dashato_logo_light_mode.png"
                alt="Dashato"
                className="h-9 w-auto dark:hidden object-contain group-hover:scale-105 transition-transform"
              />
              <img
                src="/Dashato_logo_dark_mode.png"
                alt="Dashato"
                className="h-9 w-auto hidden dark:block object-contain group-hover:scale-105 transition-transform"
              />
            </Link>
          </div>

          {/* Autocomplete Search Bar */}
          <div className="relative flex-1 max-w-2xl hidden md:block">
            <form onSubmit={handleSearchSubmit} className="flex items-center rounded-xl border border-border bg-card overflow-hidden focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent transition-all">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-muted text-xs font-medium text-foreground px-3 py-2.5 border-r border-border focus:outline-none cursor-pointer"
              >
                <option value="all">{t.allDepartments}</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.slug}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <Input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-0 bg-transparent focus-visible:ring-0 text-sm py-2.5 px-4 shadow-none text-foreground"
              />
              <Button type="submit" variant="default" className="rounded-none h-full px-5 bg-primary hover:bg-primary-hover">
                <Search className="w-4 h-4 text-primary-foreground" />
              </Button>
            </form>

            {/* Autocomplete suggestions dropdown */}
            {suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-card rounded-xl border border-border shadow-2xl z-50 overflow-hidden">
                {suggestions.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setSuggestions([]);
                      router.push(`/products/${item.slug}`);
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-muted flex items-center justify-between text-sm text-card-foreground border-b border-border last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <Search className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="font-medium">{item.title}</span>
                    </div>
                    <span className="text-xs text-primary font-semibold">${item.price.toFixed(2)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Action Links: Language, Theme, Account, Wishlist, Quick Cart */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            <LanguageToggle />
            <ThemeToggle />

            {/* Account Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-muted">
                  <User className="w-5 h-5 text-foreground" />
                  <div className="hidden lg:flex flex-col text-left">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                      {session?.user ? t.hello : t.signIn}
                    </span>
                    <span className="text-xs font-semibold text-foreground flex items-center gap-1">
                      {session?.user?.name ? session.user.name.split(' ')[0] : t.account}
                      <ChevronDown className="w-3 h-3 text-muted-foreground" />
                    </span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {session?.user ? (
                  <>
                    <DropdownMenuLabel className="flex flex-col">
                      <span className="font-bold text-foreground">{session.user.name}</span>
                      <span className="text-xs font-normal text-muted-foreground">{session.user.email}</span>
                      <span className="mt-1 inline-block text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded w-fit uppercase">
                        Role: {session.user.role}
                      </span>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {session.user.role === 'ADMIN' && (
                      <DropdownMenuItem onClick={() => router.push('/admin')}>
                        <LayoutDashboard className="w-4 h-4 mr-2 text-primary" /> {t.adminDashboard}
                      </DropdownMenuItem>
                    )}
                    {session.user.role === 'VENDOR' && (
                      <DropdownMenuItem onClick={() => router.push('/vendor')}>
                        <Store className="w-4 h-4 mr-2 text-emerald-500" /> {t.vendorCenter}
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => router.push('/account')}>
                      <Package className="w-4 h-4 mr-2 text-muted-foreground" /> {t.myAccount}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => signOut()} className="text-rose-600">
                      <LogOut className="w-4 h-4 mr-2" /> {t.signOut}
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem onClick={() => router.push('/login')} className="font-bold text-primary">
                      {t.signIn}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/register')}>
                      {t.register}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push('/vendor/apply')}>
                      {t.applyVendor}
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Wishlist Shortcut */}
            <Link href="/account/wishlist" className="relative p-2 text-foreground hover:text-primary transition-colors">
              <Heart className="w-6 h-6" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Shopping Cart Button */}
            <Button
              onClick={openCartDrawer}
              variant="default"
              className="relative flex items-center gap-2.5 px-3 sm:px-4 py-2 bg-primary text-primary-foreground hover:bg-primary-hover rounded-xl shadow-sm"
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="hidden sm:inline text-xs font-bold uppercase tracking-wider">{t.cart}</span>
              <span className="bg-secondary text-secondary-foreground font-extrabold text-xs px-1.5 sm:px-2 py-0.5 rounded-full">
                {cartItemCount}
              </span>
            </Button>
          </div>
        </div>

        {/* Mobile Autocomplete Search Bar */}
        <div className="mt-2.5 relative md:hidden">
          <form onSubmit={handleSearchSubmit} className="flex items-center rounded-xl border border-border bg-card overflow-hidden focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent transition-all">
            <Input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-0 bg-transparent focus-visible:ring-0 text-xs py-2 px-3 shadow-none text-foreground"
            />
            <Button type="submit" variant="default" size="sm" className="rounded-none h-full px-4 bg-primary hover:bg-primary-hover">
              <Search className="w-4 h-4 text-primary-foreground" />
            </Button>
          </form>

          {/* Autocomplete suggestions dropdown for mobile */}
          {suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-card rounded-xl border border-border shadow-2xl z-50 overflow-hidden max-h-60 overflow-y-auto">
              {suggestions.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setSuggestions([]);
                    router.push(`/products/${item.slug}`);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-muted flex items-center justify-between text-xs text-card-foreground border-b border-border last:border-0"
                >
                  <div className="flex items-center gap-2 truncate">
                    <Search className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                    <span className="font-medium truncate">{item.title}</span>
                  </div>
                  <span className="text-xs text-primary font-semibold flex-shrink-0">${item.price.toFixed(2)}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Secondary Category Navigation Bar */}
      <nav className="hidden lg:block bg-muted/60 border-t border-border py-2.5 px-4 text-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6 font-medium text-foreground">
            <Link href="/products" className="flex items-center gap-1.5 text-primary font-bold hover:underline">
              <SlidersHorizontal className="w-3.5 h-3.5" /> {t.allCategories}
            </Link>
            {categories.slice(0, 7).map((cat) => (
              <Link key={cat.id} href={`/products?category=${cat.slug}`} className="hover:text-primary transition-colors">
                {cat.name}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-4 text-muted-foreground">
            <Link href="/products?sort=best_selling" className="hover:text-primary">{t.bestSellers}</Link>
            <Link href="/products?sort=newest" className="hover:text-primary">{t.newArrivals}</Link>
            <Link href="/deals" className="text-rose-600 dark:text-rose-400 font-bold">{t.flashDeals}</Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
