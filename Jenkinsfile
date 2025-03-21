pipeline {
    agent any
    
    tools {
        nodejs "node" // Use the configured Node.js installation from Jenkins
    }

    environment {
        SCANNER_HOME= tool 'devops_frontend'
    }

    stages {
        stage('checkout') {
            steps {
                checkout scm
            }
        }
        stage('Build') {
            steps {
                sh "npm install"
                sh "npm run build"
            }
        }
        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('devops_frontend') {
                    sh '''
                        /var/lib/jenkins/tools/hudson.plugins.sonar.SonarRunnerInstallation/devops_frontend/bin/sonar-scanner \
                        -Dsonar.projectKey=devops_frontend \
                        -Dsonar.projectName="DevOps Frontend" \
                        -Dsonar.sources=src \
                        -Dsonar.language=js \
                        -Dsonar.sourceEncoding=UTF-8
                    '''
                }
            }
        }
        
        stage('Build & Tag Docker Image') {
            steps {
               script {
                    withDockerRegistry(credentialsId: 'dockerhub-cred', toolName: 'docker') {
                            sh "docker build -t anizalmuseycai/frontend:${BUILD_NUMBER} ."
                    }
               }
            }
        }
        
        stage('Docker Image Scan') {
            steps {
                sh "trivy image --format table -o trivy-image-report.html anizalmuseycai/frontend:${BUILD_NUMBER} "
            }
        }
        
        stage('Push Docker Image') {
            steps {
               script {
                   withDockerRegistry(credentialsId: 'dockerhub-cred', toolName: 'docker') {
                            sh "docker push anizalmuseycai/frontend:${BUILD_NUMBER}"
                    }
               }
            }
        }
        
        stage('Update Playbook') {
            steps {
                sh """
                    # Update the image version in the deployment playbook
                    sed -i 's|image: anizalmuseycai/frontend.*|image: anizalmuseycai/frontend:${BUILD_NUMBER}|g' /var/lib/jenkins/playbook/deployment.yml
                    sed -i 's|name: anizalmuseycai/frontend.*|name: anizalmuseycai/frontend:${BUILD_NUMBER}|g' /var/lib/jenkins/playbook/deployment.yml
                """
            }
        }
        
        stage('Deploy with Ansible') {
            steps {
                sh """
                    cd /var/lib/jenkins/playbook
                    ansible-playbook -i inventory.ini deployment.yml
                """
            }
        }
    }
    post {
    always {
        script {
            def jobName = env.JOB_NAME
            def buildNumber = env.BUILD_NUMBER
            def pipelineStatus = currentBuild.result ?: 'UNKNOWN'
            def bannerColor = pipelineStatus.toUpperCase() == 'SUCCESS' ? 'green' : 'red'

            def body = """
                <html>
                <body>
                <div style="border: 4px solid ${bannerColor}; padding: 10px;">
                <h2>${jobName} - Build ${buildNumber}</h2>
                <div style="background-color: ${bannerColor}; padding: 10px;">
                <h3 style="color: white;">Pipeline Status: ${pipelineStatus.toUpperCase()}</h3>
                </div>
                <p>Check the <a href="${BUILD_URL}">console output</a>.</p>
                </div>
                </body>
                </html>
            """

            emailext (
                subject: "${jobName} - Build ${buildNumber} - ${pipelineStatus.toUpperCase()}",
                body: body,
                to: 'anmolchalise84@gmail.com',
                from: 'jenkins@example.com',
                replyTo: 'jenkins@example.com',
                mimeType: 'text/html',
                attachmentsPattern: 'trivy-image-report.html'
            )
        }
    }
}
    
}