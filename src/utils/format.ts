/**
 * Remove todos os caracteres não numéricos de uma string
 * @param str String a ser formatada
 * @returns String contendo apenas números
 */
export const onlyNumbers = (str: string) => str.replace(/[^\d]/g, '');
