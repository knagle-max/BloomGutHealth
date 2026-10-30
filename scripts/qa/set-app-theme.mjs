import assert from 'node:assert/strict';
/** Exercise the app's actual theme controls; browser media preference alone does not change saved theme. */
export async function setAppTheme(page,theme){
 const dark=theme==='dark';
 if(await page.evaluate(()=>document.documentElement.classList.contains('dark'))!==dark){
  const header=page.getByTestId('button-theme-toggle');
  if(await header.isVisible())await header.click();
  else{await page.getByRole('button',{name:'Open navigation',exact:true}).click();await page.getByTestId('button-menu-theme-toggle').click();}
 }
 await page.waitForFunction(expected=>document.documentElement.classList.contains('dark')===expected,dark);
 assert.equal(await page.evaluate(()=>document.documentElement.classList.contains('dark')),dark);
}
