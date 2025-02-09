import levenshtein from 'fast-levenshtein';
import { Person } from '@/types/types';

/**
 * Реализует нечёткий поиск по ФИО.
 * Клиент считается подходящим, если для каждого слова из запроса
 * найдется хотя бы одно поле (фамилия, имя или отчество), расстояние
 * Левенштейна между которым и словом не превышает 3.
 *
 * Примеры:
 * - Если введено одно слово, оно сравнивается с каждым из полей.
 * - Если введено два слова, для каждого из них должно быть найдено совпадение
 *   хотя бы в одном из полей.
 *
 * @param data - массив объектов Person
 * @param query - поисковый запрос (например, "Иван" или "Иван Иванов")
 * @returns отфильтрованный массив, содержащий подходящих клиентов
 */
export function fuzzySearch<T extends Person>(data: T[], query: string): T[] {
  if (!query.trim()) return data;

  // Разбиваем запрос по пробелам и приводим все к нижнему регистру
  const queryParts = query.trim().toLowerCase().split(/\s+/);

  return data.filter((item) => {
    // Получаем массив полей ФИО в нижнем регистре
    const fields = [
      item.last_name.toLowerCase(),
      item.first_name.toLowerCase(),
      item.middle_name.toLowerCase(),
    ];

    // Для каждого слова из запроса проверяем, что хотя бы одно поле удовлетворяет условию
    return queryParts.every((q) => fields.some((field) => levenshtein.get(field, q) <= 3));
  });
}
