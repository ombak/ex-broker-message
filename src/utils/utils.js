'use strict';


/**
 * Function to check if data is null of empty or undefined
 * @param string val
 * @returns boolean
 */
export async function isEmpty(val) {
    return (
        val === undefined || 
        val == null || 
        val.length <= 0) ? true : false;
}