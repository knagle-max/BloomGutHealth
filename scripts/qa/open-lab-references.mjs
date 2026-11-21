/** A deliberate user action in the optional editorial source administration. */
export async function openLabReferences(root){
 const details=root.locator('.lab-editorial-reference-admin').first();await details.waitFor({state:'attached'});
 if(!await details.evaluate(el=>el.open))await details.locator(':scope > summary').click();
}
