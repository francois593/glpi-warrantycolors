<?php
declare(strict_types=1);

/** Read-only CLI boundary checks for the Warranty Colors export limit. */
if (PHP_SAPI !== 'cli') {
    http_response_code(403);
    exit(1);
}

$autoload = dirname(__DIR__, 3) . '/vendor/autoload.php';
if (!is_file($autoload)) {
    fwrite(STDERR, "Run this test from an installed GLPI plugins/warrantycolors directory.\n");
    exit(2);
}

require_once $autoload;
require_once __DIR__ . '/../src/Export/WarrantyExportLimit.php';

use GlpiPlugin\Warrantycolors\Export\WarrantyExportLimit;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

$tests = [
    ['999', 999, 'ALLOW'],
    ['1000', 1000, 'ALLOW'],
    ['1001', 1001, 'HTTP422'],
    ['string 1000', '1000', 'ALLOW'],
    ['string 1001', '1001', 'HTTP422'],
    ['null', null, 'INVALID'],
    ['negative', -1, 'INVALID'],
    ['non-numeric', 'abc', 'INVALID'],
];

$failed = 0;
foreach ($tests as [$label, $count, $expected]) {
    $actual = 'ALLOW';
    try {
        WarrantyExportLimit::assertAllowed($count, 1000);
    } catch (UnprocessableEntityHttpException $exception) {
        $actual = $exception->getStatusCode() === 422 ? 'HTTP422' : 'WRONG_HTTP';
    } catch (RuntimeException $exception) {
        $actual = 'INVALID';
    } catch (Throwable $exception) {
        $actual = 'ERROR:' . get_class($exception);
    }
    $pass = $actual === $expected;
    $failed += $pass ? 0 : 1;
    printf('[%s] %-16s expected=%s actual=%s\n', $pass ? 'PASS' : 'FAIL', $label, $expected, $actual);
}
exit($failed === 0 ? 0 : 1);
