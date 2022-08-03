<?php

namespace Synthetic;

use Synthetic\SyntheticManager;
use Illuminate\Support\Facades\Blade;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;
use Illuminate\Foundation\Http\Events\RequestHandled;
use Illuminate\Foundation\Http\Middleware\ConvertEmptyStringsToNull;
use Illuminate\Foundation\Http\Middleware\TrimStrings;

class SyntheticServiceProvider extends ServiceProvider
{
    public function register()
    {
        $this->app->singleton(SyntheticManager::class);
        $this->app->alias(SyntheticManager::class, 'synthetic');
    }

    public function boot()
    {
        $this->routes();
        $this->directives();
        $this->injectJavaScript();
        $this->skipRequestPayloadTamperingMiddleware();
    }

    function routes()
    {
        Route::get('/synthetic/synthetic.js', [JavaScriptAssets::class, 'source']);
        // Route::get('/synthetic/synthetic.js.map', [JavaScriptAssets::class, 'maps']);

        Route::post('/synthetic/update', function () {
            $targets = request('targets');

            $responses = [];

            foreach ($targets as $target) {
                $snapshot = $target['snapshot'];
                $diff = $target['diff'];
                $calls = $target['calls'];

                $responses[] = app('synthetic')->update($snapshot, $diff, $calls);
            }

            return $responses;
        });
    }

    function directives()
    {
        Blade::directive('synthesize', function ($expression) {
            return sprintf(
                "synthesize(<?php echo \%s::from(app('synthetic')->synthesize(%s))->toHtml() ?>)",
                \Illuminate\Support\Js::class, $expression
            );
        });
    }

    function injectJavaScript()
    {
        app('events')->listen(RequestHandled::class, function ($handled) {
            if (! str($handled->response->headers->get('content-type'))->contains('text/html')) return;

            $html = $handled->response->getContent();

            if (str($html)->contains('</html>')) {
                $csrf = csrf_token();
                $replacement = <<<EOT
                    <script>window.__csrf = '{$csrf}'</script>
                    <script type="text/javascript" src="/synthetic/synthetic.js"></script>
                </html>
                EOT;
                $html = str($html)->replaceLast('</html>', $replacement);
                $html = str($html)->replaceFirst('</head>', '<script>window.synthesize = () => console.warn("Trying to access synthesize before it\'s loaded.")</script></head>');
                $handled->response->setContent($html->__toString());
            } else {

            }
        });
    }

    function skipRequestPayloadTamperingMiddleware()
    {
        ConvertEmptyStringsToNull::skipWhen(function () {
            return request()->is('synthetic/update');
        });

        TrimStrings::skipWhen(function () {
            return request()->is('synthetic/update');
        });
    }
}
