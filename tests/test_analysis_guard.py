"""Run with: python -m unittest discover -s tests -p 'test_*.py'."""
import unittest
from fastapi import HTTPException
from ml_service.main import MicrobiomeAnalysisRequest, analyze_microbiome

class AnalysisGuardTest(unittest.IsolatedAsyncioTestCase):
    async def test_file_upload_cannot_generate_a_demo_profile(self):
        request = MicrobiomeAnalysisRequest(sample_id='sample', user_id='user', file_path='/tmp/test.fastq')
        with self.assertRaises(HTTPException) as result:
            await analyze_microbiome(request)
        self.assertEqual(result.exception.status_code, 422)
        self.assertIn('not implemented', result.exception.detail)

    async def test_empty_abundances_cannot_generate_a_demo_profile(self):
        request = MicrobiomeAnalysisRequest(sample_id='sample', user_id='user', raw_data={'bacteria_percentages': {}})
        with self.assertRaises(HTTPException) as result:
            await analyze_microbiome(request)
        self.assertEqual(result.exception.status_code, 422)
