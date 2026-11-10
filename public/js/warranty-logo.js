/*
 * Warranty Colors 1.0.1
 * Center only the Warranty Colors logo in GLPI Marketplace.
 * Keep native horizontal positioning and image dimensions.
 */
(function () {
    'use strict';

    const selector =
        '.marketplace li.plugin[data-key="warrantycolors"]';

    let scheduled = false;
    let observedMain = null;
    let observedImage = null;

    function centerY(element) {
        const rect = element.getBoundingClientRect();
        return (rect.top + rect.bottom) / 2;
    }

    const resizeObserver = typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(schedule)
        : null;

    function centerLogo() {
        const card = document.querySelector(selector);
        const main = card?.querySelector('.main');
        const img = main?.querySelector('.icon img');

        if (!main || !img) {
            return;
        }

        if (resizeObserver && main !== observedMain) {
            resizeObserver.disconnect();
            resizeObserver.observe(main);
            observedMain = main;
        }

        if (img !== observedImage) {
            observedImage = img;
            img.addEventListener('load', schedule);
        }

        // Same calculation validated in Chrome.
        const offset = centerY(main) - centerY(img);

        if (!Number.isFinite(offset) || Math.abs(offset) < 0.25) {
            return;
        }

        const previous = Number(img.dataset.wcLogoOffset || '0');
        const total = previous + offset;

        // Positive translation moves the image DOWN.
        img.style.transform = `translateY(${total}px)`;
        img.dataset.wcLogoOffset = String(total);
    }

    function schedule() {
        if (scheduled) {
            return;
        }

        scheduled = true;

        requestAnimationFrame(() => {
            scheduled = false;
            centerLogo();
        });
    }

    function init() {
        let marketplaceObserver = null;

        function attach(marketplace) {
            marketplaceObserver = new MutationObserver(schedule);
            marketplaceObserver.observe(marketplace, {
                childList: true,
                subtree: true
            });
            schedule();
        }

        const marketplace = document.querySelector('.marketplace');

        if (marketplace) {
            attach(marketplace);
        } else {
            // GLPI may insert the Marketplace after DOMContentLoaded.
            const pendingObserver = new MutationObserver(() => {
                const found = document.querySelector('.marketplace');

                if (found) {
                    pendingObserver.disconnect();
                    attach(found);
                }
            });

            pendingObserver.observe(document.body, {
                childList: true,
                subtree: true
            });
        }

        window.addEventListener('resize', schedule, {
            passive: true
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, {
            once: true
        });
    } else {
        init();
    }
})();
