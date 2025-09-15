export function truncateWithEllipsis(str: string, length: number) {
    if (str.length <= length) {
        return str;
    } else {
        return str.slice(0, length - 3) + "...";
    }
}

export function joinAnd(val: string[], options: {
    // Separator between all but the last value
    separator?: string,
    // Separator before last value (preceeded with space or `separator` if oxfordComma is true)
    finalSeparator?: string,
    // Should there be a separator between the penultimate value & finalSeparator?
    oxfordComma?: boolean
} = {}) {
    if (val.length === 1) return val[0];

    const separator = options.separator ?? ', ';
    const finalSeparator = options.finalSeparator ?? 'and ';
    const oxfordComma = options.oxfordComma ?? false;

    return val.slice(0, -1).join(separator) +
        (oxfordComma ? separator : ' ') +
        finalSeparator +
        val[val.length - 1];
}

const VOWEL_ISH = ['a', 'e', 'i', 'o', 'u', 'y'];
export function aOrAn(value: string) {
    if (VOWEL_ISH.includes(value[0].toLowerCase())) return 'an';
    else return 'a';
}