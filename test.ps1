# Function to make requests and handle errors
function Make-Request {
    param (
        [string]$Uri,
        [string]$Method = "GET",
        [string]$Body = $null,
        [string]$TestName
    )
    
    Write-Host "`n=== $TestName ===" -ForegroundColor Cyan
    Write-Host "Making $Method request to: $Uri" -ForegroundColor Gray
    
    try {
        $params = @{
            Uri = $Uri
            Method = $Method
            ErrorAction = 'Stop'
        }
        
        if ($Body) {
            $params.Body = $Body
            $params.ContentType = 'application/json'
        }
        
        $response = Invoke-WebRequest @params
        Write-Host "Response Status: $($response.StatusCode)" -ForegroundColor Green
        Write-Host "Response Body:" -ForegroundColor Yellow
        Write-Host ($response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 4)
        return $response
    }
    catch {
        Write-Host "Error: $_" -ForegroundColor Red
        Write-Host "Response: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}

# Run all tests with less verbose output
$tests = @(
    @{ Uri = "http://localhost:8000/health"; TestName = "Health Check" },
    @{ Uri = "http://localhost:8000/test-cache"; TestName = "Cache Recording" },
    @{ Uri = "http://localhost:8000/copy-cat/recorded-apis"; TestName = "List APIs" },
    @{ Uri = "http://localhost:8000/copy-cat/replay/test-cache"; TestName = "Replay Test" }
)

foreach ($test in $tests) {
    Make-Request @test
    Start-Sleep -Milliseconds 500
}

# Cache test with multiple requests
Write-Host "`n=== Cache Test ===" -ForegroundColor Cyan
1..3 | ForEach-Object {
    Make-Request -Uri "http://localhost:8000/quick-cache-test" -TestName "Cache Request $_"
    Start-Sleep -Milliseconds 500
}

# 6. Test recording new API
$body = @{
    targetUrl = 'https://jsonplaceholder.typicode.com/todos/1'  # Changed from api.example.com to a real API
    method = 'GET'
} | ConvertTo-Json

Make-Request -Uri "http://localhost:8000/copy-cat/record" -Method "POST" -Body $body -TestName "Record New API"

# Test external API recording
$externalApiTest = @{
    targetUrl = 'https://jsonplaceholder.typicode.com/posts/1'
    method = 'GET'
} | ConvertTo-Json

Make-Request -Uri "http://localhost:8000/copy-cat/record" -Method "POST" -Body $externalApiTest -TestName "Record External API"
