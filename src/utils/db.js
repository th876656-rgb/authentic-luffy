// Supabase database wrapper
import { supabase } from './supabase.js';

class Database {
    constructor() {
        // No initialization needed for Supabase
    }

    async init() {
        // Test connection
        const { error } = await supabase.from('products').select('count');
        if (error) throw error;
        return true;
    }

    // Products operations
    async add(storeName, data) {
        const { data: result, error } = await supabase
            .from(storeName)
            .insert([data])
            .select()
            .single();

        if (error) throw error;
        return result;
    }

    async get(storeName, key) {
        const { data, error } = await supabase
            .from(storeName)
            .select('*')
            .eq('id', key)
            .single();

        if (error) throw error;
        return data;
    }

    async getAll(storeName) {
        const { data, error } = await supabase
            .from(storeName)
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    }

    async update(storeName, data) {
        const { data: result, error } = await supabase
            .from(storeName)
            .update(data)
            .eq('id', data.id)
            .select()
            .single();

        if (error) throw error;
        return result;
    }

    async delete(storeName, key) {
        const { error } = await supabase
            .from(storeName)
            .delete()
            .eq('id', key);

        if (error) throw error;
        return true;
    }

    async clearStore(storeName) {
        const { error } = await supabase
            .from(storeName)
            .delete()
            .neq('id', ''); // Delete all rows

        if (error) throw error;
        return true;
    }

    // Product-specific methods
    async getProductsBySKU(sku) {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('sku', sku)
            .single();

        if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
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

    // Settings operations
    async getSetting(key) {
        const { data, error } = await supabase
            .from('settings')
            .select('value')
            .eq('key', key)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data?.value;
    }

    async updateSetting(key, value) {
        const { data, error } = await supabase
            .from('settings')
            .upsert({ key, value, updated_at: new Date().toISOString() })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    // Hero operations
    async getHero() {
        const { data, error } = await supabase
            .from('hero')
            .select('*')
            .eq('id', 'main')
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data;
    }

    async updateHero(heroData) {
        const { data, error } = await supabase
            .from('hero')
            .upsert({ ...heroData, id: 'main', updated_at: new Date().toISOString() })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    // Initialize default data (not needed for Supabase - data is already in DB)
    async initializeDefaultData() {
        // Data is already initialized via SQL script
        console.log('Data already initialized in Supabase');
        return true;
    }

    // Backup/Restore (not needed for Supabase - data is on server)
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

        // Clear existing data
        await this.clearStore(storeName);

        // Insert new data
        const { error } = await supabase
            .from(storeName)
            .insert(dataArray);

        if (error) throw error;
        return true;
    }
}

// Create and export singleton instance
const db = new Database();
export default db;
