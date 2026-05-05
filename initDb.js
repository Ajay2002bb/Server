const db = require('./db');

async function init() {
  console.log('Initializing database...');

  // Create Users table
  await db.schema.dropTableIfExists('favorites');
  await db.schema.dropTableIfExists('users');
  await db.schema.dropTableIfExists('templates');

  await db.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('username').notNullable().unique();
    table.string('password').notNullable();
  });

  // Create Templates table
  await db.schema.createTable('templates', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.text('description').notNullable();
    table.string('thumbnail_url').notNullable();
    table.string('category').notNullable();
  });

  // Create Favorites table
  await db.schema.createTable('favorites', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().references('users.id').onDelete('CASCADE');
    table.integer('template_id').unsigned().references('templates.id').onDelete('CASCADE');
    table.unique(['user_id', 'template_id']);
  });

  // Seed Templates
  const templates = [
    {
      name: 'Modern SaaS Dashboard',
      description: 'A beautiful dashboard template for SaaS applications.',
      thumbnail_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=400&q=80',
      category: 'Dashboard'
    },
    {
      name: 'E-commerce Storefront',
      description: 'Complete storefront template with product grids and cart.',
      thumbnail_url: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=400&q=80',
      category: 'E-commerce'
    },
    {
      name: 'Agency Landing Page',
      description: 'Clean and professional landing page for agencies.',
      thumbnail_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=400&q=80',
      category: 'Landing Page'
    },
    {
      name: 'Personal Portfolio',
      description: 'Showcase your work with this elegant portfolio template.',
      thumbnail_url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=400&q=80',
      category: 'Portfolio'
    },
    {
      name: 'Blog Theme',
      description: 'Minimalist blog template focusing on readability.',
      thumbnail_url: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=400&q=80',
      category: 'Blog'
    }
  ];

  await db('templates').insert(templates);

  console.log('Database initialized successfully with seeded data.');
  process.exit(0);
}

init().catch(err => {
  console.error(err);
  process.exit(1);
});
