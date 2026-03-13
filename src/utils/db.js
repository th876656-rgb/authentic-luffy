// Supabase database wrapper with offline-resilient caching
import { supabase } from './supabase.js';

// In-memory cache để giảm các lần gọi Supabase lặp lại
const memCache = {};
const MEM_CACHE_TTL = 3 * 60 * 1000; // 3 phút

function getMemCache(key) {
    const entry = memCache[key];
    if (!entry) return null;
    if (Date.now() - entry.ts > MEM_CACHE_TTL) {
        delete memCache[key];
        return null;
    }
    return entry.data;
}

function setMemCache(key, data) {
    memCache[key] = { data, ts: Date.now() };
}

function clearMemCache() {
    Object.keys(memCache).forEach(k => delete memCache[k]);
}

class Database {
    constructor() {
        // No initialization needed for Supabase
    }

    async init() {
        // Test connection - nếu lỗi không throw, chỉ warn
        try {
            const { error } = await supabase.from('products').select('count', { count: 'exact', head: true });
            if (error) {
                console.warn('Supabase connection check failed:', error.message);
                return false;
            }
            return true;
        } catch (e) {
            console.warn('Supabase init error:', e.message);
            return false;
        }
    }

    // Products operations
    async add(storeName, data) {
        const { data: result, error } = await supabase
            .from(storeName)
            .insert([data])
            .select()
            .single();

        if (error) throw error;
        clearMemCache(); // Xóa cache khi có thay đổi
        return result;
    }

    async get(storeName, key) {
        const cacheKey = `get_${storeName}_${key}`;
        const cached = getMemCache(cacheKey);
        if (cached) return cached;

        const { data, error } = await supabase
            .from(storeName)
            .select('*')
            .eq('id', key)
            .single();

        if (error) throw error;
        setMemCache(cacheKey, data);
        return data;
    }

    async getAll(storeName) {
        const cacheKey = `getAll_${storeName}`;
        const cached = getMemCache(cacheKey);
        if (cached) return cached;

        const { data, error } = await supabase
            .from(storeName)
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        const result = data || [];
        setMemCache(cacheKey, result);
        return result;
    }

    async update(storeName, data) {
        const { data: result, error } = await supabase
            .from(storeName)
            .update(data)
            .eq('id', data.id)
            .select()
            .single();

        if (error) throw error;
        clearMemCache(); // Xóa cache khi có thay đổi
        return result;
    }

    async delete(storeName, key) {
        const { error } = await supabase
            .from(storeName)
            .delete()
            .eq('id', key);

        if (error) throw error;
        clearMemCache();
        return true;
    }

    async clearStore(storeName) {
        const { error } = await supabase
            .from(storeName)
            .delete()
            .neq('id', '');

        if (error) throw error;
        clearMemCache();
        return true;
    }

    // Product-specific methods
    async getProductsBySKU(sku) {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('sku', sku)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data;
    }

    async getProductsByCategory(category) {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('category', category)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    }

    async searchProducts(query) {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    }

    // Settings operations - với in-memory cache
    async getSetting(key) {
        const cacheKey = `setting_${key}`;
        const cached = getMemCache(cacheKey);
        if (cached !== null) return cached;

        const { data, error } = await supabase
            .from('settings')
            .select('value')
            .eq('key', key)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        const value = data?.value || null;
        setMemCache(cacheKey, value);
        return value;
    }

    async updateSetting(key, value) {
        // Xóa cache cho setting này
        delete memCache[`setting_${key}`];

        const { data: existing } = await supabase
            .from('settings')
            .select('id')
            .eq('key', key)
            .single();

        let result, err;
        const now = new Date().toISOString();

        if (existing?.id) {
            const res = await supabase
                .from('settings')
                .update({ value, updated_at: now })
                .eq('id', existing.id)
                .select()
                .single();
            result = res.data;
            err = res.error;
        } else {
            const res = await supabase
                .from('settings')
                .insert([{ key, value, updated_at: now }])
                .select()
                .single();
            result = res.data;
            err = res.error;
        }

        if (err) {
            console.error('updateSetting error:', err);
            throw err;
        }
        return result;
    }

    // Hero operations
    async getHero() {
        try {
            const heroContent = await this.getSetting('hero_content');
            if (heroContent) return heroContent;
        } catch (e) {
            console.warn('Failed to get hero from settings, checking legacy table');
        }

        const { data, error } = await supabase
            .from('hero')
            .select('*')
            .eq('id', 'main')
            .single();

        if (error && error.code !== 'PGRST116') throw error;

        if (data) {
            return {
                backgroundImage: data.image,
                subtitle: data.subtitle,
                buttonText: data.cta_text,
                title1: data.title,
                title2: '',
                badge: ''
            };
        }
        return null;
    }

    async updateHero(heroData) {
        return await this.updateSetting('hero_content', heroData);
    }

    async initializeDefaultData() {
        console.log('Data already initialized in Supabase');
        return true;
    }

    async exportData() {
        const products = await this.getAll('products');
        const categories = await this.getAll('categories');
        const settings = await this.getSetting('footer');
        const hero = await this.getHero();

        return {
            products,
            categories,
            settings: settings ? { footer: settings } : {},
            hero: hero ? [hero] : []
        };
    }

    async restoreStore(storeName, dataArray) {
        if (!dataArray || !Array.isArray(dataArray)) return;
        await this.clearStore(storeName);
        const { error } = await supabase
            .from(storeName)
            .insert(dataArray);
        if (error) throw error;
        return true;
    }
}

const db = new Database();
export default db;
