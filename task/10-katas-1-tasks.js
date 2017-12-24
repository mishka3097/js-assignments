'use strict';

/**
 * Returns the array of 32 compass points and heading.
 * See details here:
 * https://en.wikipedia.org/wiki/Points_of_the_compass#32_cardinal_points
 *
 * @return {array}
 *
 * Example of return :
 *  [
 *     { abbreviation : 'N',     azimuth : 0.00 ,
 *     { abbreviation : 'NbE',   azimuth : 11.25 },
 *     { abbreviation : 'NNE',   azimuth : 22.50 },
 *       ...
 *     { abbreviation : 'NbW',   azimuth : 348.75 }
 *  ]
 */
function createCompassPoints() {
    function* directCoors(from, to, dir) {
        let result = [`${from}b${to}`, `${from}${from}${to}`, `${from}${to}b${from}`, `${from}${to}`, `${from}${to}b${to}`, `${to}${from}${to}`, `${to}b${from}`];

        if (dir == "f")
            result.reverse();

        for (let i of result) {
            yield i;
        }
    }

    let result = [],
        azimuth = 0,
        items = [
            {dir: "N", func: directCoors("N", "E", "d")},
            {dir: "E", func: directCoors("S", "E", "f")},
            {dir: "S", func: directCoors("S", "W", "d")},
            {dir: "W", func: directCoors("N", "W", "f")}
        ];

    items.forEach(item => {
        result.push({abbreviation: item.dir, azimuth: azimuth});
        azimuth += 11.25;

        for (let i = 0; i < 7; i++) {
            result.push({abbreviation: item.func.next().value, azimuth: azimuth});
            azimuth += 11.25;
        }
    });

    return result;
}


/**
 * Expand the braces of the specified string.
 * See https://en.wikipedia.org/wiki/Bash_(Unix_shell)#Brace_expansion
 *
 * In the input string, balanced pairs of braces containing comma-separated substrings
 * represent alternations that specify multiple alternatives which are to appear at that position in the output.
 *
 * @param {string} str
 * @return {Iterable.<string>}
 *
 * NOTE: The order of output string does not matter.
 *
 * Example:
 *   '~/{Downloads,Pictures}/*.{jpg,gif,png}'  => '~/Downloads/*.jpg',
 *                                                '~/Downloads/*.gif'
 *                                                '~/Downloads/*.png',
 *                                                '~/Pictures/*.jpg',
 *                                                '~/Pictures/*.gif',
 *                                                '~/Pictures/*.png'
 *
 *   'It{{em,alic}iz,erat}e{d,}, please.'  => 'Itemized, please.',
 *                                            'Itemize, please.',
 *                                            'Italicized, please.',
 *                                            'Italicize, please.',
 *                                            'Iterated, please.',
 *                                            'Iterate, please.'
 *
 *   'thumbnail.{png,jp{e,}g}'  => 'thumbnail.png'
 *                                 'thumbnail.jpeg'
 *                                 'thumbnail.jpg'
 *
 *   'nothing to do' => 'nothing to do'
 */
function* expandBraces(str) {
    const queue = [],
        regex = new RegExp("\{([0-9a-zA-Z\.,]+)\}", 'i'),
        itemSet = new Set;

    queue.push(str);

    while (queue.length) {
        let item = queue.shift();
        let matches = item.match(regex);

        if (matches != null) {
            let array = matches[1].split(',');

            array.forEach(curr => {
                queue.push(item.replace(matches[0], curr));
            });
        } else if (!itemSet.has(item)) {
            itemSet.add(item);
            yield item;
        }
    }
}


/**
 * Returns the ZigZag matrix
 *
 * The fundamental idea in the JPEG compression algorithm is to sort coefficient of given image by zigzag path and encode it.
 * In this task you are asked to implement a simple method to create a zigzag square matrix.
 * See details at https://en.wikipedia.org/wiki/JPEG#Entropy_coding
 * and zigzag path here: https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/JPEG_ZigZag.svg/220px-JPEG_ZigZag.svg.png
 *
 * @param {number} n - matrix dimension
 * @return {array}  n x n array of zigzag path
 *
 * @example
 *   1  => [[0]]
 *
 *   2  => [[ 0, 1 ],
 *          [ 2, 3 ]]
 *
 *         [[ 0, 1, 5 ],
 *   3  =>  [ 2, 4, 6 ],
 *          [ 3, 7, 8 ]]
 *
 *         [[ 0, 1, 5, 6 ],
 *   4 =>   [ 2, 4, 7,12 ],
 *          [ 3, 8,11,13 ],
 *          [ 9,10,14,15 ]]
 *
 */
function getZigZagMatrix(n) {
    function* nextStepGenerator(n) {
        function swap(dir) {
            return dir == 1 ? 0 : 1;
        }

        let tmp = n * n, i = 0, j = 0, dir = 0;

        while (tmp--) {
            yield {x: i, y: j};

            // dir = 0  --  UP,  dir = 1  --  DOWN
            if (dir == 0) {
                if (j == n - 1) {
                    i++;
                    dir = swap(dir);
                    continue;
                }

                if (i == 0) {
                    j++;
                    dir = swap(dir);
                    continue;
                }

                i--;
                j++;
            } else {
                if (i == n - 1) {
                    j++;
                    dir = swap(dir);
                    continue;
                }

                if (j == 0) {
                    i++;
                    dir = swap(dir);
                    continue;
                }

                i++;
                j--;
            }
        }
    }

    let result = Array.from({length: n}, () => null),
        gen = nextStepGenerator(n);

    result = result.map(() => Array.from({length: n}, () => 0));

    for (let i = 0; i < n * n; i++) {
        let stage = gen.next().value;

        result[stage["x"]][stage["y"]] = i;
    }

    return result;
}


/**
 * Returns true if specified subset of dominoes can be placed in a row accroding to the game rules.
 * Dominoes details see at: https://en.wikipedia.org/wiki/Dominoes
 *
 * Each domino tile presented as an array [x,y] of tile value.
 * For example, the subset [1, 1], [2, 2], [1, 2] can be arranged in a row (as [1, 1] followed by [1, 2] followed by [2, 2]),
 * while the subset [1, 1], [0, 3], [1, 4] can not be arranged in one row.
 * NOTE that as in usual dominoes playing any pair [i, j] can also be treated as [j, i].
 *
 * @params {array} dominoes
 * @return {bool}
 *
 * @example
 *
 * [[0,1],  [1,1]] => true
 * [[1,1], [2,2], [1,5], [5,6], [6,3]] => false
 * [[1,3], [2,3], [1,4], [2,4], [1,5], [2,5]]  => true
 * [[0,0], [0,1], [1,1], [0,2], [1,2], [2,2], [0,3], [1,3], [2,3], [3,3]] => false
 *
 */
function canDominoesMakeRow(dominoes) {
    function dfs(current, value, left) {
        if (left == 0) {
            result = true;
            return;
        }

        visited[current] = true;

        for (let i = 0; i < dominoes.length; i++)
            if (!visited[i]) {
                if (dominoes[i].indexOf(value) != -1) {
                    dfs(i, dominoes[i][0] == value ? dominoes[i][1] : dominoes[i][0], left - 1);
                }
            }

        visited[current] = false;
    }

    let result = false,
        visited = Array.from({length: dominoes.length}, () => false);

    for (let i = 0; i < dominoes.length; i++) {
        dfs(i, dominoes[i][0], dominoes.length - 1);
        dfs(i, dominoes[i][1], dominoes.length - 1);
    }

    return result;
}


/**
 * Returns the string expression of the specified ordered list of integers.
 *
 * A format for expressing an ordered list of integers is to use a comma separated list of either:
 *   - individual integers
 *   - or a range of integers denoted by the starting integer separated from the end integer in the range by a dash, '-'.
 *     (The range includes all integers in the interval including both endpoints)
 *     The range syntax is to be used only for, and for every range that expands to more than two values.
 *
 * @params {array} nums
 * @return {bool}
 *
 * @example
 *
 * [ 0, 1, 2, 3, 4, 5 ]   => '0-5'
 * [ 1, 4, 5 ]            => '1,4,5'
 * [ 0, 1, 2, 5, 7, 8, 9] => '0-2,5,7-9'
 * [ 1, 2, 4, 5]          => '1,2,4,5'
 */
function extractRanges(nums) {
    let result = {
        string: "",
        add: (s) => {
            if (result.string != "")
                result.string += ",";

            result.string += s;
        },
        pack: (a, b) => {
            if (a == b)
                result.add(a);
            else if (Math.abs(a - b) == 1)
                result.add(`${a},${b}`);
            else
                result.add(`${a}-${b}`);
        }
    };
    let from = 0;
    nums.sort((a, b)=> a - b);

    if (nums.length == 1)
        return nums[0];

    for (let j = from + 1; j < nums.length; j++) {
        if (nums[j] - nums[j - 1] != 1) {
            result.pack(nums[from], nums[j - 1]);
            from = j;
        }
        if (j == nums.length - 1) {
            result.pack(nums[from], nums[j]);
        }
    }

    return result.string;
}

module.exports = {
    createCompassPoints : createCompassPoints,
    expandBraces : expandBraces,
    getZigZagMatrix : getZigZagMatrix,
    canDominoesMakeRow : canDominoesMakeRow,
    extractRanges : extractRanges
};
