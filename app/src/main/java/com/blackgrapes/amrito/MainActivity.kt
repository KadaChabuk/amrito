package com.blackgrapes.amrito

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import com.blackgrapes.amrito.ui.components.BookContent
import com.blackgrapes.amrito.ui.components.BookCover
import com.blackgrapes.amrito.ui.theme.AmritoTheme
import com.blackgrapes.amrito.ui.theme.BookColors

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        setContent {
            AmritoTheme {
                var isBookOpen by remember { mutableStateOf(false) }
                
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = BookColors.PageBackground
                ) {
                    if (!isBookOpen) {
                        BookCover(
                            modifier = Modifier.fillMaxSize(),
                            onOpeningComplete = { isBookOpen = true }
                        )
                    } else {
                        BookContent()
                    }
                }
            }
        }
    }
}