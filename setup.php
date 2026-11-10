<?php
/**
 * Warranty Colors — lightweight read-only warranty visualisation for GLPI.
 * Version 1.0.1 for GLPI 11.
 */

declare(strict_types=1);

use Glpi\Plugin\Hooks;

const PLUGIN_WARRANTYCOLORS_VERSION = '1.0.1';

function plugin_init_warrantycolors(): void
{
    global $PLUGIN_HOOKS;

    $PLUGIN_HOOKS['csrf_compliant']['warrantycolors'] = true;
    $PLUGIN_HOOKS[Hooks::ADD_CSS]['warrantycolors'] = [
        'css/warranty-colors.css',
        'css/warranty-filters.css',
    ];
    $PLUGIN_HOOKS[Hooks::ADD_JAVASCRIPT]['warrantycolors'] = [
        'js/warranty-colors.js',
        'js/warranty-labels.js',
        'js/warranty-filters.js',
        'js/warranty-exports.js',
        'js/warranty-logo.js',
    ];
}

function plugin_version_warrantycolors(): array
{
    return [
        'name' => 'Warranty Colors',
        'version' => PLUGIN_WARRANTYCOLORS_VERSION,
        'author' => 'Warranty Colors contributors',
        'license' => 'MIT',
        'requirements' => [
            'glpi' => [
                'min' => '11.0.0',
                'max' => '11.99.99',
            ],
        ],
    ];
}

function plugin_warrantycolors_check_prerequisites(): bool
{
    return version_compare(GLPI_VERSION, '11.0.0', '>=')
        && version_compare(GLPI_VERSION, '12.0.0', '<');
}

function plugin_warrantycolors_check_config(bool $verbose = false): bool
{
    return true;
}
