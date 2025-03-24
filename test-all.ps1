# Import the base test function
. .\test.ps1

Write-Host "`n=== Testing All Microfeatures ===" -ForegroundColor Magenta

# 1. Test Rate Limiting
Write-Host "`n1. Testing Rate Limiting" -ForegroundColor Cyan
for ($i = 1; $i -le 6; $i++) {
    Make-Request -Uri "http://localhost:8000/test-limit" -TestName "Rate Limit Test $i"
    Start-Sleep -Milliseconds 100
}

# 2. Test Caching
Write-Host "`n2. Testing Cache System" -ForegroundColor Cyan
# First request
Make-Request -Uri "http://localhost:8000/test-cache" -TestName "Cache Initial Request"
# Immediate second request (should be cached)
Make-Request -Uri "http://localhost:8000/test-cache" -TestName "Cache Hit Check"
# Clear cache
$clearCache = @{} | ConvertTo-Json
Make-Request -Uri "http://localhost:8000/clear-cache" -Method "POST" -Body $clearCache -TestName "Cache Clear"
# Verify cache cleared
Make-Request -Uri "http://localhost:8000/test-cache" -TestName "Cache After Clear"

# 3. Test Request Recording
Write-Host "`n3. Testing Request Recording" -ForegroundColor Cyan
# Make some requests
Make-Request -Uri "http://localhost:8000/health" -TestName "Record Health Check"
Make-Request -Uri "http://localhost:8000/echo" -Method "POST" -Body '{"message":"test"}' -TestName "Record Echo"
# Check recorded APIs
Make-Request -Uri "http://localhost:8000/copy-cat/recorded-apis" -TestName "Check Recordings"

# 4. Test External API Recording
Write-Host "`n4. Testing External API Recording" -ForegroundColor Cyan
$externalTest = @{
    targetUrl = 'https://jsonplaceholder.typicode.com/posts/1'
    method = 'GET'
} | ConvertTo-Json
Make-Request -Uri "http://localhost:8000/copy-cat/record" -Method "POST" -Body $externalTest -TestName "External API Record"

# 5. Test Debug Info
Write-Host "`n5. Testing Debug Endpoint" -ForegroundColor Cyan
Make-Request -Uri "http://localhost:8000/copy-cat/debug" -TestName "Debug Info Check"

# Final Status Report
Write-Host "`n=== Microfeatures Status ===" -ForegroundColor Green
$features = @(
    @{ Name = "Rate Limiting"; Endpoint = "/test-limit" },
    @{ Name = "Caching System"; Endpoint = "/test-cache" },
    @{ Name = "Request Recording"; Endpoint = "/copy-cat/recorded-apis" },
    @{ 
        Name = "External API Recording"
        Endpoint = "/copy-cat/record"
        Method = "POST"
        Body = @{
            targetUrl = "https://jsonplaceholder.typicode.com/todos/1"  # Changed URL
            method = "GET"
        } | ConvertTo-Json
    },
    @{ Name = "Debug System"; Endpoint = "/copy-cat/debug" },
    @{ Name = "ML Service"; Endpoint = "/ml/health" }
)

foreach ($feature in $features) {
    $params = @{
        Uri = "http://localhost:8000$($feature.Endpoint)"
        TestName = "Status Check"
        Method = if ($feature.Method) { $feature.Method } else { "GET" }
    }
    if ($feature.Body) {
        $params.Body = $feature.Body
    }
    
    $result = Make-Request @params
    $status = if ($result.StatusCode -eq 200) { "✅ Working" } else { "❌ Failed" }
    Write-Host "$($feature.Name): $status" -ForegroundColor $(if ($status -eq "✅ Working") { "Green" } else { "Red" })
}
