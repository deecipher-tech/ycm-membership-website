# Use official PHP with Apache
FROM php:8.2-apache

# Enable rewrite module
RUN a2enmod rewrite

# Install common PHP extensions (adjust if you need others)
RUN apt-get update && apt-get install -y \
    libpng-dev libjpeg-dev libfreetype6-dev zip unzip git \
  && docker-php-ext-configure gd --with-freetype --with-jpeg \
  && docker-php-ext-install pdo pdo_mysql mysqli gd zip

# Set working directory
WORKDIR /var/www/html

# Copy project files
COPY . /var/www/html

# Make Apache serve the public/ folder as DocumentRoot
RUN sed -i 's/DocumentRoot \/var\/www\/html/DocumentRoot \/var\/www\/html\/public/g' /etc/apache2/sites-enabled/000-default.conf \
 && sed -i 's/<Directory \/var\/www\/>/<Directory \/var\/www\/html\/public>/g' /etc/apache2/apache2.conf || true

# Adjust Apache ports to Render preferred port 10000 (Render will map to this)
RUN sed -i 's/80/10000/g' /etc/apache2/ports.conf \
 && sed -i 's/:80/:10000/g' /etc/apache2/sites-enabled/000-default.conf

# Ensure uploads are writable
RUN mkdir -p /var/www/html/public/uploads \
 && chown -R www-data:www-data /var/www/html/public/uploads \
 && chmod -R 775 /var/www/html/public/uploads

# Expose port 10000
EXPOSE 10000

# Start apache in foreground
CMD ["apache2-foreground"]
