(() => {
    const self = {
        products: [],
        favorites: [],
        apiURL: "https://gist.githubusercontent.com/sevindi/8bcbde9f02c1d4abe112809c974e1f49/raw/9bf93b58df623a9b16f1db721cd0a7a539296cf0/products.json",
        localStorageKeys: {
            products: "sm_ebebek_products",
            favorites: "sm_ebebek_favorites"
        }
    };

    const init = async () => {
        if (window.location.pathname !== "/") {
            console.log("wrong page");

            return;
        }

        if (document.getElementById("sm-custom-carousel")) {
            console.log("Karusel zaten mevcut.");

            return;
        }

        await fetchData();

        if (self.products && self.products.length > 0) {
            buildCSS();
            buildHTML();
            setEvents();
        } else {
            console.log('Yüklenecek ürün bulunamadı, karusel oluşturulmuyor.');
        }
    };

    const fetchData = async () => {
        const storedFavorites = localStorage.getItem(self.localStorageKeys.favorites);
        self.favorites = storedFavorites ? JSON.parse(storedFavorites) : [];

        const storedProducts = localStorage.getItem(self.localStorageKeys.products);

        if (storedProducts) {
            try {
                self.products = JSON.parse(storedProducts);

                console.log("Ürünler localStorage'dan yüklendi.");
            } catch (error) {
                self.products = [];
            }
        }

        if (!self.products || self.products.length === 0) {
            try {
                const response = await fetch(self.apiURL);

                if (!response.ok) throw new Error(`Network response was not ok. Status: ${response.status}`);

                const data = await response.json();

                if (Array.isArray(data)) {
                    self.products = data;

                    localStorage.setItem(self.localStorageKeys.products, JSON.stringify(self.products));

                    console.log("Ürünler API'den çekildi ve localStorage'a kaydedildi.");
                } else {
                    throw new Error("API'den gelen veri formatı bir dizi (array) değil.");
                }
            } catch (error) {
                console.error("Veri çekme hatası:", error);

                self.products = [];
            }
        }
    };

    const buildCSS = () => {
        const css = `
            #sm-custom-carousel { width: 100%; background-color: #fef8f0; padding: 40px 0; margin-top: 20px; font-family: "Nunito", sans-serif; }

            .sm-carousel-container { max-width: 1200px; margin: 0 auto; position: relative; }

            .sm-carousel-title { font-size: 24px; font-weight: 800; color: #333; text-align: center; margin-bottom: 20px; }

            .sm-carousel-wrapper { overflow: hidden; }

            .sm-product-list { display: flex; gap: 20px; padding: 10px; scroll-behavior: smooth; }

            .sm-product-card { min-width: calc(20% - 16px); background-color: #fff; border: 1px solid #eee; border-radius: 8px; overflow: hidden; text-align: center; display: flex; flex-direction: column; justify-content: space-between; transition: box-shadow 0.3s; position: relative; }

            .sm-product-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
            .sm-product-link { text-decoration: none; color: inherit; display: flex; flex-direction: column; height: 100%; }

            .sm-product-image-wrapper { position: relative; }

            .sm-product-image { width: 100%; height: auto; aspect-ratio: 1/1; object-fit: contain; padding: 10px; }

            .sm-favorite-icon { position: absolute; top: 10px; right: 10px; cursor: pointer; z-index: 10; width: 24px; height: 24px; }

            .sm-favorite-icon svg { width: 100%; height: 100%; stroke: #ff8a00; stroke-width: 2; fill: transparent; transition: fill 0.2s; }

            .sm-favorite-icon.favorited svg { fill: #ff8a00; stroke: #ff8a00; }

            .sm-discount-badge { position: absolute; top: 10px; left: 10px; background-color: #ff5c5c; color: #fff; font-size: 12px; font-weight: bold; padding: 4px 8px; border-radius: 4px; }

            .sm-product-info { padding: 15px; flex-grow: 1; display: flex; flex-direction: column; justify-content: center; }

            .sm-product-name { font-size: 14px; font-weight: 600; min-height: 40px; margin-bottom: 10px; }

            .sm-price-container { display: flex; justify-content: center; align-items: center; gap: 10px; margin-top: auto; }

            .sm-original-price { font-size: 14px; color: #999; text-decoration: line-through; }

            .sm-current-price { font-size: 18px; font-weight: 800; color: #00b050; }

            .sm-carousel-arrow { position: absolute; top: 50%; transform: translateY(-50%); background-color: #fff; border: 1px solid #ddd; border-radius: 50%; width: 40px; height: 40px; cursor: pointer; z-index: 20; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 5px rgba(0,0,0,0.1); transition: background-color 0.3s; }

            .sm-carousel-arrow:hover { background-color: #f5f5f5; }

            .sm-carousel-arrow.sm-arrow-left { left: -20px; }

            .sm-carousel-arrow.sm-arrow-right { right: -20px; }

            .sm-carousel-arrow svg { width: 20px; height: 20px; stroke: #333; stroke-width: 3; }

            @media (max-width: 1200px) { .sm-product-card { min-width: calc(25% - 15px); } .sm-carousel-arrow.sm-arrow-left { left: 10px; } .sm-carousel-arrow.sm-arrow-right { right: 10px; } }

            @media (max-width: 992px) { .sm-product-card { min-width: calc(33.33% - 14px); } }

            @media (max-width: 768px) { .sm-product-card { min-width: calc(50% - 10px); } .sm-carousel-title { font-size: 20px; } }

            @media (max-width: 576px) { .sm-product-card { min-width: calc(80%); } }
        `;

        const styleTag = document.createElement('style');
        styleTag.innerHTML = css;
        document.head.appendChild(styleTag);
    };

    const buildHTML = () => {
        let productCardsHTML = self.products.map(product => {
            const isFavorited = self.favorites.includes(String(product.id)); 
            const hasDiscount = product.original_price && product.original_price > product.price;
            let discountBadgeHTML = '';

            if (hasDiscount) {
                const discountPercentage = Math.round(((product.original_price - product.price) / product.original_price) * 100);
                discountBadgeHTML = `<div class="sm-discount-badge">%${discountPercentage} İNDİRİM</div>`;
            }

            return `
                <div class="sm-product-card" data-product-id="${product.id}">
                    <div class="sm-favorite-icon ${isFavorited ? 'favorited' : ''}" title="Favorilere Ekle">
                        <svg viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                    </div>

                    <a href="${product.url}" target="_blank" class="sm-product-link">
                        <div class="sm-product-image-wrapper">
                            ${discountBadgeHTML}
                            <img src="${product.img}" alt="${product.name}" class="sm-product-image" />
                        </div>

                        <div class="sm-product-info">
                            <p class="sm-product-name">${product.name}</p>

                            <div class="sm-price-container">
                                ${hasDiscount ? `<span class="sm-original-price">${formatPrice(product.original_price)}</span>` : ''}
                                <span class="sm-current-price">${formatPrice(product.price)}</span>
                            </div>
                        </div>
                    </a>
                </div>`;
        }).join('');

        const carouselHTML = `
            <section id="sm-custom-carousel">
                <div class="sm-carousel-container">
                    <h2 class="sm-carousel-title">Beğenebileceğinizi düşündüklerimiz</h2>

                    <div class="sm-carousel-wrapper"><div class="sm-product-list">${productCardsHTML}</div></div>
                    <div class="sm-carousel-arrow sm-arrow-left"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="15 18 9 12 15 6"></polyline></svg></div>

                    <div class="sm-carousel-arrow sm-arrow-right"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="9 18 15 12 9 6"></polyline></svg></div>
                </div>
            </section>`;

        const mainSlider = document.querySelector('.main-slider');

        if (mainSlider) {
            mainSlider.insertAdjacentHTML('afterend', carouselHTML);
        } else {
            document.body.insertAdjacentHTML('afterbegin', carouselHTML);
        }
    };

    const setEvents = () => {
        const productList = document.querySelector('.sm-product-list');
        const leftArrow = document.querySelector('.sm-arrow-left');
        const rightArrow = document.querySelector('.sm-arrow-right');
        
        const scrollCarousel = (direction) => {
            const card = productList.querySelector('.sm-product-card');

            if (!card) return;

            const scrollAmount = card.offsetWidth + 20;
            productList.scrollLeft += direction * scrollAmount;
        };

        rightArrow.addEventListener('click', () => scrollCarousel(1));
        leftArrow.addEventListener('click', () => scrollCarousel(-1));
        
        const carouselContainer = document.getElementById('sm-custom-carousel');

        carouselContainer.addEventListener('click', (e) => {
            const favoriteIcon = e.target.closest('.sm-favorite-icon');

            if (favoriteIcon) {
                e.stopPropagation();

                const card = favoriteIcon.closest('.sm-product-card');
                const productId = card.dataset.productId;
                favoriteIcon.classList.toggle('favorited');
                const index = self.favorites.indexOf(productId);

                if (index > -1) {
                    self.favorites.splice(index, 1);
                } else {
                    self.favorites.push(productId);
                }

                localStorage.setItem(self.localStorageKeys.favorites, JSON.stringify(self.favorites));
            }
        });
    };
    
    const formatPrice = (price) => {
        if (price === null || typeof price === 'undefined') return '';

        return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(price);
    };

    init();
})();