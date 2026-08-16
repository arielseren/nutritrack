import type { FoodItem } from '../types';

/**
 * Service to fetch real product data from Open Food Facts API
 * Open Food Facts is a free, open database containing millions of Israeli and international barcodes.
 */
export const OpenFoodFactsService = {
  async fetchProductByBarcode(barcode: string): Promise<FoodItem | null> {
    const cleanBarcode = barcode.trim();
    if (!cleanBarcode) return null;

    try {
      const response = await fetch(
        `https://world.openfoodfacts.org/api/v2/product/${cleanBarcode}.json`,
        {
          headers: {
            'User-Agent': 'NutriTrackApp/1.0 (Israel Nutrition Tracker)',
          },
        }
      );

      if (!response.ok) return null;

      const data = await response.json();
      if (data.status !== 1 || !data.product) {
        return null;
      }

      const product = data.product;
      const nutriments = product.nutriments || {};

      const calories =
        nutriments['energy-kcal_100g'] ||
        nutriments['energy-kcal'] ||
        (nutriments['energy_100g'] ? Math.round(nutriments['energy_100g'] / 4.184) : 0);

      const protein = nutriments.proteins_100g || nutriments.proteins || 0;
      const carbs = nutriments.carbohydrates_100g || nutriments.carbohydrates || 0;
      const fat = nutriments.fat_100g || nutriments.fat || 0;
      const fiber = nutriments.fiber_100g || nutriments.fiber || undefined;

      const name =
        product.product_name_he ||
        product.product_name ||
        product.product_name_en ||
        `מוצר (${cleanBarcode})`;

      const brand = product.brands || product.brands_tags?.[0] || undefined;
      const imageUrl = product.image_url || product.image_front_url || undefined;
      const servingUnit = product.serving_size || 'מנה (100 גרם)';
      const servingGrams = parseFloat(product.serving_quantity) || 100;

      const foodItem: FoodItem = {
        id: `off_${cleanBarcode}`,
        name,
        brand,
        calories: Math.round(Number(calories) || 0),
        protein: Math.round(Number(protein) * 10) / 10,
        carbs: Math.round(Number(carbs) * 10) / 10,
        fat: Math.round(Number(fat) * 10) / 10,
        fiber: fiber ? Math.round(Number(fiber) * 10) / 10 : undefined,
        servingUnit,
        servingGrams: Math.round(servingGrams) || 100,
        category: 'popular',
        barcode: cleanBarcode,
        imageUrl,
      };

      return foodItem;
    } catch (err) {
      console.warn('Open Food Facts API lookup failed:', err);
      return null;
    }
  },
};
