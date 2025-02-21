import levenshtein from 'fast-levenshtein';

/**
 * Универсальная функция нечёткого поиска с поддержкой клиентов, риэлторов и недвижимости.
 *
 * @param data - массив объектов (клиенты, риэлторы или недвижимость)
 * @param query - поисковый запрос
 * @param getFields - функция, возвращающая текстовые поля объекта для поиска
 * @param getNumberFields - функция, возвращающая поля номера дома и квартиры (если применимо)
 * @param maxTextDistance - максимальное расстояние Левенштейна для строковых полей (по умолчанию 3)
 * @param maxNumberDistance - максимальное расстояние Левенштейна для номеров дома и квартиры (по умолчанию 1)
 * @returns отфильтрованный массив объектов, соответствующих критериям поиска
 */
export function fuzzySearch<T>(
  data: T[],
  query: string,
  getFields: (item: T) => string[],
  getNumberFields?: (item: T) => string[],
  maxTextDistance: number = 3,
  maxNumberDistance: number = 1,
): T[] {
  if (!query.trim()) return data;

  const queryParts = query.trim().toLowerCase().split(/\s+/);
  console.log('Query parts:', queryParts);

  return data.filter((item, index) => {
    const textFields = getFields(item)
      .map((field) => field?.toLowerCase().trim())
      .filter(Boolean); // Remove undefined, null, or empty strings

    const numberFields = getNumberFields
      ? getNumberFields(item)
          .map((field) => field?.toLowerCase().trim())
          .filter(Boolean)
      : [];

    console.log(`\nItem [${index}]:`, item);
    console.log('  Text fields:', textFields);
    console.log('  Number fields:', numberFields);

    // Calculate Levenshtein distances for text fields
    let textMatch = false;
    for (const q of queryParts) {
      for (const field of textFields) {
        const distance = levenshtein.get(field, q);
        console.log(`  Text distance: "${field}" vs "${q}" =`, distance);
        if (distance <= maxTextDistance) {
          textMatch = true;
          break;
        }
      }
      if (textMatch) break; // No need to check further
    }
    console.log('  Text match result:', textMatch);

    // Calculate Levenshtein distances for number fields
    let numberMatch = !numberFields.length; // Default to true if no number fields
    if (numberFields.length) {
      for (const q of queryParts) {
        for (const field of numberFields) {
          const distance = levenshtein.get(field, q);
          console.log(`  Number distance: "${field}" vs "${q}" =`, distance);
          if (distance <= maxNumberDistance) {
            numberMatch = true;
            break;
          }
        }
        if (numberMatch) break; // No need to check further
      }
    }
    console.log('  Number match result:', numberMatch);

    const overallMatch = textMatch && numberMatch;
    console.log('  Overall match:', overallMatch);

    return overallMatch;
  });
}
