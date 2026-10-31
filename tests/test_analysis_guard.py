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
        self.assertEqual(first.model_version, 'reported-abundance-v3')
        self.assertIsNone(first.confidence)

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

    async def test_viome_json_keeps_reported_data_without_inventing_abundance(self):
        import tempfile, json
        from pathlib import Path
        from ml_service.services.data_processor import DataProcessor
        report = {'schema_version': '1.0', 'data_origin': 'Synthetic reconstruction', 'scores': [{'name': 'Example pathway', 'score': 42}], 'organisms': [{'organism': 'Example organism', 'reported_status': 'detected', 'quantitative_abundance': 'Not provided'}]}
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / 'viome.json'
            path.write_text(json.dumps(report))
            result = DataProcessor()._process_json_file(path)
            self.assertEqual(result['type'], 'functional_report')
            self.assertEqual(result['raw_data'], report)
            self.assertNotIn('bacteria_percentages', result['raw_data'])
            self.assertEqual(result['preview']['quantified_taxa'], 0)

    async def test_scores_are_not_an_abundance_analysis_input(self):
        request = MicrobiomeAnalysisRequest(sample_id='sample', user_id='user', raw_data={'scores': [{'name': 'Example', 'score': 42}], 'organisms': ['Example']})
        with self.assertRaises(HTTPException) as result:
            await analyze_microbiome(request)
        self.assertEqual(result.exception.status_code, 422)
        self.assertIn('Functional/pathway scores', result.exception.detail)

    async def test_json_filename_drives_processing_and_invalid_structure_is_clear(self):
        import io, json
        from pathlib import Path
        from fastapi import UploadFile
        from ml_service.services.data_processor import DataProcessor
        report = {'scores': [{'name': 'Example', 'score': 42}]}
        result = await DataProcessor().process_upload(UploadFile(filename='original-report.json', file=io.BytesIO(json.dumps(report).encode())))
        try:
            self.assertEqual(result['format'], 'json')
            self.assertEqual(result['raw_data'], report)
        finally:
            Path(result['file_path']).unlink(missing_ok=True)
