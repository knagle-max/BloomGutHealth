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

    async def test_invalid_percentages_rejected(self):
        request = MicrobiomeAnalysisRequest(sample_id='sample', user_id='user', raw_data={'bacteria_percentages': {'Roseburia': 120}})
        with self.assertRaises(HTTPException) as result:
            await analyze_microbiome(request)
        self.assertEqual(result.exception.status_code, 422)

    async def test_structured_analysis_is_deterministic_and_does_not_invent_gene_counts(self):
        request = MicrobiomeAnalysisRequest(sample_id='sample', user_id='user', raw_data={'bacteria_percentages': {'Roseburia': 3.2}})
        first = await analyze_microbiome(request)
        second = await analyze_microbiome(request)
        self.assertEqual(first.metabolites, second.metabolites)
        self.assertEqual(first.bacterial_composition[0]['abundance'], 3.2)
        self.assertIsNone(first.bacterial_composition[0]['genome_data']['gene_count'])
        self.assertEqual(first.model_version, 'experimental-abundance-v2')
        self.assertEqual(first.confidence, 0)

    async def test_csv_import_reads_all_rows_and_preserves_values(self):
        import tempfile
        from pathlib import Path
        from ml_service.services.data_processor import DataProcessor
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / 'report.csv'
            path.write_text('bacteria,abundance\n' + '\n'.join(f'Taxon{i},1' for i in range(8)))
            result = DataProcessor()._process_csv_file(path)
            self.assertEqual(len(result['raw_data']['bacteria_percentages']), 8)
            self.assertEqual(result['raw_data']['bacteria_percentages']['Taxon7'], 1)

    async def test_report_validation_rejects_duplicates_or_nonfinite_percentages(self):
        import tempfile
        from pathlib import Path
        from ml_service.services.data_processor import DataProcessor
        processor = DataProcessor()
        with self.assertRaises(ValueError):
            processor._validate_percentages({'a': float('nan')})
        with self.assertRaises(ValueError):
            processor._validate_percentages({'a': True})
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / 'report.csv'
            path.write_text('bacteria,abundance\nRoseburia,3\nRoseburia,4')
            with self.assertRaises(ValueError):
                processor._process_csv_file(path)
