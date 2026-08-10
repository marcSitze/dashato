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
                  <Menu className="w-5 h-5 text-slate-700 dark:text-slate-200" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2 text-xl font-bold">
                    <span className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-2.5 py-1 rounded-lg">
                      Dashato
                    </span>
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-6 flex flex-col space-y-4">
                  <Link href="/products" className="font-semibold text-slate-900 dark:text-slate-100 hover:text-amber-500">
                    All Products
                  </Link>
                  <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Shop by Category</p>
                    {categories.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/products?category=${cat.slug}`}
                        className="block py-1.5 text-sm text-slate-600 dark:text-slate-300 hover:text-amber-500"
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <Link href="/" className="flex items-center gap-2 group">
              <div className="bg-amber-500 text-slate-950 font-black text-xl px-3 py-1 rounded-xl shadow-md group-hover:scale-105 transition-transform flex items-center gap-1">
                <span>Dashato</span>
                <Sparkles className="w-4 h-4 fill-slate-950" />
              </div>
            </Link>
          </div>

          {/* Autocomplete Search Bar */}
          <div className="relative flex-1 max-w-2xl hidden md:block">
            <form onSubmit={handleSearchSubmit} className="flex items-center rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 overflow-hidden focus-within:ring-2 focus-within:ring-amber-500 focus-within:border-transparent transition-all">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 px-3 py-2.5 border-r border-slate-300 dark:border-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="all">All Departments</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.slug}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <Input
                type="text"
                placeholder="Search millions of products, tech gear, appliances..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-0 bg-transparent focus-visible:ring-0 text-sm py-2.5 px-4 shadow-none"
              />
              <Button type="submit" variant="default" className="rounded-none h-full px-5 bg-amber-500 hover:bg-amber-400">
                <Search className="w-4 h-4 text-slate-950" />
              </Button>
            </form>

            {/* Autocomplete suggestions dropdown */}
            {suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl z-50 overflow-hidden">
                {suggestions.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setSuggestions([]);
                      router.push(`/products/${item.slug}`);
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between text-sm text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800/50 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <Search className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-medium">{item.title}</span>
                    </div>
                    <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold">${item.price.toFixed(2)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Action Links: Account, Wishlist, Quick Cart */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Account Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
                  <User className="w-5 h-5 text-slate-700 dark:text-slate-200" />
                  <div className="hidden lg:flex flex-col text-left">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      {session?.user ? 'Hello,' : 'Sign In'}
                    </span>
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-1">
                      {session?.user?.name ? session.user.name.split(' ')[0] : 'Account'}
                      <ChevronDown className="w-3 h-3 text-slate-400" />
                    </span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {session?.user ? (
                  <>
                    <DropdownMenuLabel className="flex flex-col">
                      <span className="font-bold text-slate-900 dark:text-slate-100">{session.user.name}</span>
                      <span className="text-xs font-normal text-slate-500">{session.user.email}</span>
                      <span className="mt-1 inline-block text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded w-fit uppercase">
                        Role: {session.user.role}
                      </span>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {session.user.role === 'ADMIN' && (
                      <DropdownMenuItem onClick={() => router.push('/admin')}>
                        <LayoutDashboard className="w-4 h-4 mr-2 text-amber-500" /> Admin Dashboard
                      </DropdownMenuItem>
                    )}
                    {session.user.role === 'VENDOR' && (
                      <DropdownMenuItem onClick={() => router.push('/vendor')}>
                        <Store className="w-4 h-4 mr-2 text-emerald-500" /> Vendor Center
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => router.push('/account')}>
                      <Package className="w-4 h-4 mr-2 text-slate-500" /> My Account & Orders
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => signOut()} className="text-rose-600">
                      <LogOut className="w-4 h-4 mr-2" /> Sign Out
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem onClick={() => router.push('/login')} className="font-bold text-amber-600">
                      Sign In
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/register')}>
                      Create Account
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push('/vendor/apply')}>
                      Apply as Vendor
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Wishlist Shortcut */}
            <Link href="/account/wishlist" className="relative p-2 text-slate-700 dark:text-slate-200 hover:text-amber-500 transition-colors">
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
              className="relative flex items-center gap-2.5 px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 dark:bg-amber-500 dark:text-slate-950 dark:hover:bg-amber-400 rounded-xl"
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="hidden sm:inline text-xs font-bold uppercase tracking-wider">Cart</span>
              <span className="bg-amber-500 dark:bg-slate-950 text-slate-950 dark:text-amber-400 font-extrabold text-xs px-2 py-0.5 rounded-full">
                {cartItemCount}
              </span>
            </Button>
          </div>
        </div>
      </div>

      {/* Secondary Category Navigation Bar */}
      <nav className="hidden lg:block bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 py-2.5 px-4 text-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6 font-medium text-slate-700 dark:text-slate-300">
            <Link href="/products" className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold hover:underline">
              <SlidersHorizontal className="w-3.5 h-3.5" /> All Categories
            </Link>
            {categories.slice(0, 7).map((cat) => (
              <Link key={cat.id} href={`/products?category=${cat.slug}`} className="hover:text-amber-500 transition-colors">
                {cat.name}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400">
            <Link href="/products?sort=best_selling" className="hover:text-amber-500">Best Sellers</Link>
            <Link href="/products?sort=newest" className="hover:text-amber-500">New Arrivals</Link>
            <Link href="/deals" className="text-rose-600 dark:text-rose-400 font-bold">Flash Deals</Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
