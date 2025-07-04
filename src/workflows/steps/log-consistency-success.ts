export async function logConsistencySuccess(context: any): Promise<any> {
  const { totalChecked } = context.steps['compare-data'].output;
  
  console.log(`Consistency check passed: ${totalChecked} events checked, no inconsistencies found`);
  
  return { success: true, totalChecked };
}
