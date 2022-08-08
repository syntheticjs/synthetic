<?php

namespace Synthetic;

use Illuminate\Foundation\Http\Middleware\ConvertEmptyStringsToNull;
use Illuminate\Foundation\Http\Middleware\TrimStrings;
use Illuminate\Foundation\Http\Events\RequestHandled;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Blade;
use Synthetic\Synthesizers\AnonymousSynth;
use Synthetic\SyntheticManager;

class SyntheticServiceProvider extends ServiceProvider
{
    public function register()
    {
        $this->app->alias(SyntheticManager::class, 'synthetic');
        $this->app->singleton(SyntheticManager::class);
        AnonymousSynth::registerAnonymousCacheClassAutoloader();
    }

    public function boot()
    {
        $this->skipRequestPayloadTamperingMiddleware();
        $this->injectJavaScript();
        $this->directives();
        $this->features();
        $this->routes();
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
                $html = str($html)->replaceFirst('</head>', '<script>window.synthetic = () => console.warn("Trying to access synthesize before it\'s loaded.")</script></head>');
                $handled->response->setContent($html->__toString());
            } else {
                //
            }
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

    function features()
    {
        foreach ([
            \Synthetic\Features\SupportRedirects::class,
            \Synthetic\Features\SupportJsMethods::class,
        ] as $feature) {
            (new $feature)();
        }
    }

    function routes()
    {
        Route::get('/synthetic/synthetic.js', [JavaScriptAssets::class, 'source']);
        // Route::get('/synthetic/synthetic.js.map', [JavaScriptAssets::class, 'maps']);

        Route::post('/synthetic/new', function () {
            $name = request('name');

            return app('synthetic')->new($name);
        });

        Route::post('/synthetic/update', function () {
            $targets = request('targets');

            $responses = [];

            foreach ($targets as $target) {
                $snapshot = $target['snapshot'];
                $diff = $target['diff'];
                $calls = $target['calls'];

                $response = app('synthetic')->update($snapshot, $diff, $calls);

                unset($response['target']);

                $responses[] = $response;
            }

            return $responses;
        })->middleware('web');
    }
}
