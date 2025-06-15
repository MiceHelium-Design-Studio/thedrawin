
/**
 * Script to create 10 random Lebanese users in Supabase Auth and profiles table.
 * 
 * Usage: node seed-lebanese-users.js
 * Requirements: Node.js, @supabase/supabase-js install: npm install @supabase/supabase-js
 */

const { createClient } = require('@supabase/supabase-js');

// Replace with your project credentials
const SUPABASE_URL = 'https://vfmulngualkzxwdzcbwb.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmbXVsbmd1YWxrenh3ZHpjYndiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzMjUyNzUsImV4cCI6MjA1OTkwMTI3NX0.4289VvjF4cN8B-f4-fRYXb7mSfau-r1xefFGwoJdUCI';

// Lebanese first and last names for better realism
const firstNames = ['Ali', 'Karim', 'Maya', 'Layla', 'Jad', 'Nour', 'Rami', 'Tarek', 'Samira', 'Zein'];
const lastNames = ['Hassan', 'Khalil', 'Saad', 'Mansour', 'Rahme', 'Abboud', 'Hijazi', 'Karam', 'Antoun', 'Sleiman'];

// Generates a random 8-digit mobile number starting with +961
function randomLebanesePhone() {
    return '+961' + (Math.random() < 0.5 ? '3' : '7') + Math.floor(1000000 + Math.random() * 9000000);
}

// Generate a random user object
function generateUser(i) {
    const name = `${firstNames[i % firstNames.length]} ${lastNames[i % lastNames.length]}`;
    const base = firstNames[i % firstNames.length].toLowerCase() + '.' + lastNames[i % lastNames.length].toLowerCase();
    const email = `${base}${Math.floor(100 + Math.random() * 900)}@testlebanon.com`;
    const phone = randomLebanesePhone();
    return {
        email,
        password: 'TestPassword123!', // test password, you can change this
        name,
        phone,
    };
}

async function main() {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    for (let i = 0; i < 10; i++) {
        const user = generateUser(i);

        // Register the user in Supabase Auth
        const { data, error } = await supabase.auth.signUp({
            email: user.email,
            password: user.password,
            options: {
                data: {
                    name: user.name,
                    phone: user.phone
                }
            }
        });

        if (error) {
            // If user already exists, log and skip; otherwise, show error
            if (error.message.toLowerCase().includes('user already registered')) {
                console.log(`User ${user.email} already exists. Skipping.`);
            } else {
                console.error(`Error signing up ${user.email}:`, error.message);
            }
        } else {
            console.log(`Created user: ${user.email} (${user.name})`);
        }
    }

    // Note: The Supabase "handle_new_user" trigger will auto-create the profiles rows
    console.log('User creation finished. Check your Supabase Auth and profiles table!');
}

main().catch((e) => {
    console.error('Fatal error:', e);
    process.exit(1);
});

