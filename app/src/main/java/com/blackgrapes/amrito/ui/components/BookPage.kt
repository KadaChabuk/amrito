package com.blackgrapes.amrito.ui.components

import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.blackgrapes.amrito.R

@Composable
fun BookPage(
    modifier: Modifier = Modifier,
    pageContent: String
) {
    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(horizontal = 24.dp, vertical = 32.dp)
    ) {
        // A simple parser for the demo content
        pageContent.lines().forEach { line ->
            when {
                line.startsWith("## ") -> {
                    Text(
                        text = line.removePrefix("## "),
                        style = MaterialTheme.typography.headlineSmall.copy(fontWeight = FontWeight.Bold),
                        lineHeight = 30.sp
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                }
                line.startsWith("# ") -> {
                    Text(
                        text = line.removePrefix("# "),
                        style = MaterialTheme.typography.headlineMedium.copy(fontWeight = FontWeight.Bold)
                    )
                    Spacer(modifier = Modifier.height(24.dp))
                }
                line.startsWith("[") && line.endsWith("]") -> {
                    // For now, we'll use a placeholder image
                    Image(painter = painterResource(id = R.drawable.ic_launcher_background), contentDescription = "Book illustration")
                    Spacer(modifier = Modifier.height(16.dp))
                }
                line.isNotBlank() -> {
                    Text(text = line, style = MaterialTheme.typography.bodyLarge, lineHeight = 24.sp)
                    Spacer(modifier = Modifier.height(16.dp))
                }
            }
        }
    }
}