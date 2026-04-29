#include <pthread.h>
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <time.h>

#define NUM_PHILOSOPHERS 5

pthread_mutex_t forks[NUM_PHILOSOPHERS];

void* dine(void* arg) {
    int id = *(int*)arg;
    
    int left_fork = id;
    int right_fork = (id + 1) % NUM_PHILOSOPHERS;
    
    int first_fork = left_fork;
    int second_fork = right_fork;

    if (id == NUM_PHILOSOPHERS - 1) {
        first_fork = right_fork;
        second_fork = left_fork;
    }

    for (int i = 0; i < 3; i++) {
        printf("Philosopher %d is THINKING.\n", id);
        usleep((rand() % 100) * 1000);

        pthread_mutex_lock(&forks[first_fork]);
        pthread_mutex_lock(&forks[second_fork]);

        printf("Philosopher %d is EATING.\n", id);
        usleep((rand() % 100) * 1000);

        pthread_mutex_unlock(&forks[second_fork]);
        pthread_mutex_unlock(&forks[first_fork]);
    }

    printf("Philosopher %d has finished dining and leaves the table.\n", id);

    pthread_exit(NULL);
}

int main() {
    pthread_t philosophers[NUM_PHILOSOPHERS];
    int ids[NUM_PHILOSOPHERS];

    srand(time(NULL));

    for (int i = 0; i < NUM_PHILOSOPHERS; i++) {
        pthread_mutex_init(&forks[i], NULL);
    }
  
    for (int i = 0; i < NUM_PHILOSOPHERS; i++) {
        ids[i] = i;
        if (pthread_create(&philosophers[i], NULL, dine, &ids[i]) != 0) {
            perror("Error creating thread");
            return 1;
        }
    }

    for (int i = 0; i < NUM_PHILOSOPHERS; i++) {
        pthread_join(philosophers[i], NULL);
    }

    for (int i = 0; i < NUM_PHILOSOPHERS; i++) {
        pthread_mutex_destroy(&forks[i]);
    }

    printf("All philosophers have finished. The table is empty.\n");
    return 0;
}
